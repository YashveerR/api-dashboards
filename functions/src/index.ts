import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const nodemailer = require("nodemailer");

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.sendMail = functions.https.onCall(async (data, context) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  console.log(data.text.dest);
  // create reusable transporter object using the default SMTP transport
  /*   let transporter = nodemailer.createTransport({
    host: "mail.step1business.co.za ",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: functions.config().email.add, // generated ethereal user
      pass: functions.config().email.p, // generated ethereal password
    },
  }); */

  var transporter = nodemailer.createTransport({
    host: "mail.step1business.co.za",
    port: 465,
    secure: true,
    auth: {
      user: functions.config().email.add,
      pass: functions.config().email.p,
    },
  });

  // getting dest email by query string
  const dest = data.text.dest;

  // send mail with defined transport object
  await transporter.sendMail(
    {
      from: functions.config().mail.sender, // sender address
      to: functions.config().mail.receiver, // list of receivers
      subject: "User requesting access", // Subject line
      text: "The following user is requesting access: " + data.text.dest, // plain text body
      html: "<b>The following user is requesting access: </b>" + dest, // html body
    },
    (err: any, info: any) => {
      if (err) {
        console.log(err);
        return err;
      }
      console.log("no error in sending mails");
      return "OK";
    }
  );
});

exports.createUser = functions.https.onCall(async (data) => {
  admin
    .auth()
    .createUser({
      email: data.text.email,
      password: data.text.password,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
    });
});

exports.lprapi = functions.https.onCall(async (data) => {
  var sizeOf = require("image-size");
  const fs = require("fs-extra");

  var dimensions: any;
  const { dirname, join } = require("path");
  const { tmpdir } = require("os");
  const bucket = admin
    .storage()
    .bucket("gs://api-playground-step1.appspot.com"); // dangers of hard coding this thing in meow....

  const fileName = data.text.imgUrl.split("/").pop();
  console.log(fileName);
  const bucketDir = dirname(data.text.imgUrl);
  console.log(bucketDir);
  const workingDir = join(tmpdir(), "resize");
  const tmpFilePath = join(workingDir, "source.png");

  const remoteFile = bucket.file(data.text.imgUrl);
  await fs.ensureDir(workingDir);
  await remoteFile.download({ destination: tmpFilePath });

  dimensions = sizeOf(tmpFilePath);
  console.log(dimensions.width, dimensions.height);

  // Imports the Google Cloud client library
  const vision = require("@google-cloud/vision");

  console.log("Loading the vision API's");
  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    // keyFilename: "./api-playground-step1-8a3b1b01d3ff.json",
  });

  // Performs text detection on the local file
  const [result] = await client.textDetection(tmpFilePath);
  const [resultO] = await client.objectLocalization(tmpFilePath);

  const objects = resultO.localizedObjectAnnotations;
  const detections = result.fullTextAnnotation;

  const vertex_x: number[] = [];
  const vertex_y: number[] = [];

  const paragraphs: any[] = [];
  const lines: any[] = [];

  objects.forEach((object: any) => {
    if (object.name === "License plate") {
      const vertices = object.boundingPoly.normalizedVertices;
      vertices.forEach((v: any) => {
        vertex_x.push(v.x * dimensions.width);
        vertex_y.push(v.y * dimensions.height);
        //console.log(`x: ${v.x}, y:${v.y}`);
      });
    }
  });

  //using the spread operator to get the min and max values here... as the math operators require
  //a list of numbers instead of an array.. hence use the spread operator
  const plate_x1 = Math.min(...vertex_x);
  const plate_x2 = Math.max(...vertex_x);
  const plate_y1 = Math.min(...vertex_y);
  const plate_y2 = Math.max(...vertex_y);
  //console.log("Logging the objects......");
  //console.log(detections);

  detections.pages.forEach((page: any) => {
    page.blocks.forEach((block: any) => {
      block.paragraphs.forEach((paragraph: any) => {
        let para = "";
        let line = "";
        paragraph.words.forEach((word: any) => {
          word.symbols.forEach((symbol: any) => {
            //console.log("sim sim bola: ", symbol);
            let min_x = Math.min(
              symbol.boundingBox.vertices[0].x,
              symbol.boundingBox.vertices[1].x,
              symbol.boundingBox.vertices[2].x,
              symbol.boundingBox.vertices[3].x
            );
            let max_x = Math.max(
              symbol.boundingBox.vertices[0].x,
              symbol.boundingBox.vertices[1].x,
              symbol.boundingBox.vertices[2].x,
              symbol.boundingBox.vertices[3].x
            );
            let min_y = Math.min(
              symbol.boundingBox.vertices[0].y,
              symbol.boundingBox.vertices[1].y,
              symbol.boundingBox.vertices[2].y,
              symbol.boundingBox.vertices[3].y
            );
            let max_y = Math.max(
              symbol.boundingBox.vertices[0].y,
              symbol.boundingBox.vertices[1].y,
              symbol.boundingBox.vertices[2].y,
              symbol.boundingBox.vertices[3].y
            );

            if (
              min_x >= plate_x1 &&
              max_x <= plate_x2 &&
              min_y >= plate_y1 &&
              max_y <= plate_y2
            ) {
              line += symbol.text;
              if (symbol.property && symbol.property.detectedBreak) {
                if (["SPACE"].includes(symbol.property.detectedBreak.type))
                  line += " ";
                if (
                  ["EOL_SURE_SPACE", "SPACE"].includes(
                    symbol.property.detectedBreak.type
                  )
                ) {
                  line += " ";
                  lines.push(line);
                  para += line;
                  line = "";
                }
                if (
                  ["LINE_BREAK"].includes(symbol.property.detectedBreak.type)
                ) {
                  lines.push(line);

                  para += line;
                  line = "";
                }
              }
            }
          });
        });
        paragraphs.push(para);
      });
    });
  });

  console.log(paragraphs); //the found words...
  // (([A-Z]){3,7})\s*[A-Z]{2,2} RegEx for personalized plates....
  let re = new RegExp(
    "([A-Z0-9]{2,}\\s*[0-9]{1,}-*[0-9]*[A-Z]*\\s*[A-Z]*){1,8}"
  ); // eslint-disable-line

  let reP = new RegExp("(?:(([A-Z1-9]\\s*){3,7}))(?:\\s)(?:[A-Z]{2})"); // eslint-disable-line
  let ret_val;
  paragraphs.forEach((testThis: any) => {
    if (re.test(testThis)) {
      console.log("match found", testThis);
      ret_val = testThis;
    } else {
      console.log("match failed for :", testThis); //testing for personalized plates....
      if (reP.test(testThis)) {
        ret_val = testThis;
      }
    }
  });

  return ret_val;
});
