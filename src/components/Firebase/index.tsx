import app from "firebase/app";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";
import "firebase/firebase-functions";
import { v4 as uuidv4 } from "uuid";

import FirebaseContext, { withFirebase } from "./context";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  db: any;
  auth: any;
  store: any;
  functions: any;

  emailAuthProvider: typeof app.auth.EmailAuthProvider;
  fieldValue: typeof app.firestore.FieldValue;
  googleProvider: app.auth.GoogleAuthProvider;
  facebookProvider: app.auth.FacebookAuthProvider;
  twitterProvider: app.auth.TwitterAuthProvider;
  callBack: any;

  constructor() {
    app.initializeApp(config);

    this.fieldValue = app.firestore.FieldValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    console.log(this.emailAuthProvider);
    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();
    this.store = app.storage();
    this.functions = app.functions();

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doReadSingleDoc(uId: any) {
    return this.db.collection("users").doc(uId).get();
  }
  doCreateUserWithEmailAndPassword(email: any, password: any) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  doSignInWithEmailAndPassword = (email: any, password: any) =>
    firebase.auth().signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    firebase.auth().signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    firebase.auth().signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    firebase.auth().signInWithPopup(this.twitterProvider);

  doSignOut() {
    return firebase.auth().signOut();
  }

  doPasswordReset(email: any) {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  doPasswordUpdate(password: any) {
    return firebase.auth().currentUser?.updatePassword(password);
  }

  doUpdateUser(
    recID: any,
    nameP: any,
    lastnameP: any,
    emailP: any,
    numberP: any,
    addressP: any,
    suburbP: any,
    provinceP: any,
    areacodeP: any,
    termsP: any
  ) {
    this.db.collection("users").doc(recID).set(
      {
        name: nameP,
        lastname: lastnameP,
        email: emailP,
        number: numberP,
        address: addressP,
        suburb: suburbP,
        province: provinceP,
        areacode: areacodeP,
        terms: termsP,
      },
      { merge: true }
    );
  }

  async createImages(image: any, uId: any, itemName: any, itemCat: any) {
    var retImageArr: any = [];
    const storageRef = this.store.ref();
    const metadata = {
      customMetadata: {
        itemName: itemName,
        itemCat: itemCat,
      },
    };
    return new Promise(function (resolve, reject) {
      if (image === "") {
        retImageArr.push("");

        resolve(retImageArr);
      } else {
        let uploadTask = storageRef
          .child(`itemImage/${uId}/${uuidv4()}.jpg`)
          .put(image, metadata);
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function (snapshot: any) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                //console.log("Upload is paused");
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                // console.log("Upload is running");
                break;
            }
          },
          function (error: any) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case "storage/unauthorized":
                // User doesn't have permission to access the object
                reject("storage/unauthorized");
                break;

              case "storage/canceled":
                // User canceled the upload
                reject("storage/canceled");
                break;

              case "storage/unknown":
                // Unknown error occurred, inspect error.serverResponse
                reject("storage/unknown");
                break;
            }
          },
          function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function (downloadURL: any) {
                //console.log("File available at", downloadURL);
                retImageArr.push(downloadURL);

                resolve(retImageArr);
              });
          }
        );
      }
    });
  }
  createUserItem(
    uId: any,
    itemTitle: any,
    itemDesc: any,
    itemPrice: any,
    itemCategory: any,
    itemStatus: any,
    imgArr: any
  ) {
    return this.db.collection("items").doc().set(
      {
        author: uId,
        Title: itemTitle,
        Desc: itemDesc,
        Price: itemPrice,
        Cat: itemCategory,
        Status: itemStatus,
        ImgLink0: imgArr[0],
        ImgLink1: imgArr[1],
        ImgLink2: imgArr[2],
      },
      { merge: true }
    );
  }

  createDeliveryAddr(
    docId: any,
    addr1: string,
    addr2: string,
    suburbP: string,
    provinceP: string,
    areacodeP: string
  ) {
    this.db.collection("users").doc(docId).collection("myAddresses").add({
      address: addr1,
      address_0: addr2,
      suburb: suburbP,
      province: provinceP,
      areacode: areacodeP,
    });
  }

  async createTempLock(docId: any, startTime: any, endTime: any) {
    return this.db
      .collection("items")
      .doc(docId)
      .collection("tempReserve")
      .add({
        start: startTime,
        end: endTime,
      });
  }

  createRentedDate(docId: any, startTime: any, endTime: any) {
    return this.db
      .collection("items")
      .doc(docId)
      .collection("itemDates")
      .add({ startDate: startTime, endDate: endTime });
  }

  createSavedAddress(
    address1: string,
    address2: string,
    email: string,
    contact: string,
    province: string,
    city: string,
    suburb: string,
    postalcode: string,
    alias: string,
    uId: string
  ) {
    this.db
      .collection("users")
      .doc(uId)
      .collection("myAddresses")
      .doc(alias)
      .set(
        {
          addr1: address1,
          addr2: address2,
          email: email,
          contact: contact,
          province: province,
          city: city,
          suburb: suburb,
          postalCode: postalcode,
        },
        { merge: true }
      );
  }

  createCollatedOrder(
    userId: any,
    items: [],
    fname: string,
    lname: string,
    address1: string,
    address2: string,
    email: string,
    contact: string,
    province: string,
    city: string,
    suburb: string,
    postalcode: string
  ) {
    return this.db.collection("orders").doc(userId).collection("myOrders").add({
      items: items,
      paymentStat: "incomplete",
      firstName: fname,
      lastName: lname,
      addr1: address1,
      addr2: address2,
      email: email,
      contact: contact,
      province: province,
      city: city,
      suburb: suburb,
      postalCode: postalcode,
    });
  }

  createMyOrder(
    docId: any,
    itemId: any,
    itemOrderId: any,
    startTime: any,
    endTime: any,
    orderStat: any
  ) {
    this.db.collection("users").doc(docId).collection("myOrders").doc().set(
      {
        item: itemId,
        orderId: itemOrderId,
        start: startTime,
        end: endTime,
        orderStatus: orderStat,
      },
      { merge: true }
    );
  }

  createOwnerOrder(
    docId: any,
    renterId: any,
    orderId: any,
    orderStatus: any,
    item: any,
    startT: any,
    endT: any,
    itemId: any
  ) {
    this.db.collection("users").doc(docId).collection("rentedOut").doc().set(
      {
        renter: renterId,
        orderNo: orderId,
        orderStat: orderStatus,
        itemTitle: item,
        start: startT,
        end: endT,
        itemId: itemId,
      },
      { merge: true }
    );
  }

  createChatLink(uid0: any, uid1: any, docId: any) {
    return this.db.collection("chat").doc(docId).set({
      Person1: uid0,
      Person2: uid1,
    });
  }

  updateChatMessage(docID: any, message: string, uId: any) {
    const msg = { msg: message, sender: uId, time: new Date() };
    return this.db
      .collection("chat")
      .doc(docID)
      .update({
        messages: this.fieldValue.arrayUnion(msg),
      });
  }

  updateUserItem(
    docId: any,
    itemTitle: any,
    itemDesc: any,
    itemPrice: any,
    itemCategory: any,
    itemStatus: any,
    imgArr: any
  ) {
    return this.db.collection("items").doc(docId).set(
      {
        Title: itemTitle,
        Desc: itemDesc,
        Price: itemPrice,
        Cat: itemCategory,
        Status: itemStatus,
        ImgLink0: imgArr[0],
        ImgLink1: imgArr[1],
        ImgLink2: imgArr[2],
      },
      { merge: true }
    );
  }

  updateCollatedOrder(
    userId: string,
    docId: string,
    payGWStat: string,
    orderIds: [],
    payGWId: string
  ) {
    return this.db
      .collection("orders")
      .doc(userId)
      .collection("myOrders")
      .doc(docId)
      .update({
        paymentStat: payGWStat,
        orderIDs: orderIds,
        paymentID: payGWId,
      });
  }

  readPaymentStat(uId: string, docId: string) {
    return this.db
      .collection("orders")
      .doc(uId)
      .collection("myOrders")
      .doc(docId)
      .get();
  }
  readUserItems(uId: any) {
    return this.db.collection("items").where("author", "==", uId).get();
  }

  readUserItem(docId: any) {
    return this.db.collection("items").doc(docId).get();
  }

  async readAllItems() {
    return this.db.collection("items").get();
  }

  readUserOrder(uId: any) {
    return this.db.collection("users").doc(uId).collection("myOrders").get();
  }

  readCats(itemCatFilt: any) {
    return this.db.collection("items").where("Cat", "==", itemCatFilt).get();
  }

  readDeliveryAddr(uId: any) {
    return this.db.collection("users").doc(uId).collection("myAddresses").get();
  }

  doUnsubListener() {
    this.callBack();
  }

  readItemDates(docId: any) {
    return this.db
      .collection("items")
      .doc(docId)
      .collection("itemDates")
      .where("startDate", ">=", this.dateCalc())
      .orderBy("startDate")
      .get();
  }

  readOwnerOrders(uid: any) {
    return this.db.collection("users").doc(uid).collection("rentedOut").get();
  }

  readMsgs(docId: string) {
    return this.db.collection("chat").doc(docId).get();
  }

  doSendEmailVerification = () =>
    firebase.auth().currentUser?.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || "",
    });

  onAuthUserListener(next: any, fallback: any) {
    return firebase.auth().onAuthStateChanged((authUser: any) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then((snapshot: any) => {
            const dbUser = snapshot.data();

            // default empty roles

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });
  }

  updateOrder(userId: any, docId: any, itemStat: any) {
    return this.db
      .collection("users")
      .doc(userId)
      .collection("rentedOut")
      .doc(docId)
      .update({ orderStat: itemStat });
  }

  updateUserOrder(userId: any, orderId: any, itemStat: any) {
    const ret_val = this.db
      .collection("users")
      .doc(userId)
      .collection("myOrders")
      .where("orderId", "==", orderId)
      .get()
      .then((doc: any) => {
        doc.forEach((item: any) => {
          console.log(item.id, item.data().orderStatus);
          this.db
            .collection("users")
            .doc(userId)
            .collection("myOrders")
            .doc(item.id)
            .update({ orderStatus: itemStat });
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    console.log("ret_val", ret_val);
  }

  async deleteUserItem(docId: any, img0: any, img1: any, img2: any) {
    //delete the images as well
    //get the image refs...
    var imgRef0 = this.store.refFromURL(img0[0]);
    var imgRef1 = this.store.refFromURL(img1[0]);
    var imgRef2 = this.store.refFromURL(img2[0]);

    imgRef0.delete();
    imgRef1.delete();
    imgRef2.delete();

    await this.db.collection("items").doc(docId).delete();
  }

  deleteDateLocks(itemId: any, docId: any) {
    this.db
      .collection("items")
      .doc(itemId)
      .collection("tempReserve")
      .doc(docId)
      .delete();
  }

  async readDateLocks(docId: any) {
    return this.db
      .collection("items")
      .doc(docId)
      .collection("tempReserve")
      .get();
  }

  dateCalc() {
    var getDays = new Date().getDate();
    var getYr = new Date().getFullYear();
    var getMonth = new Date().getMonth();
    var datum = new Date(getYr, getMonth, getDays);
    console.log(datum.toDateString());
    return datum;
  }
  user = (uid: any) => this.db.doc(`users/${uid}`);

  users = () => this.db.collection("users");
}

export default Firebase;

export { FirebaseContext, withFirebase };
