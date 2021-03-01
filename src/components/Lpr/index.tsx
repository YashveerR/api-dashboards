import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavResult from "../Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import { RingLoader } from "react-spinners";
import "./lpr.css";

class Lpr extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
      loading: false,
    };

    this.submit_image = this.submit_image.bind(this);
  }

  imgOnChange = (event: any) => {
    if (this.maxSelectFile(event) && this.checkMimeType(event)) {
      this.setState({ [event.target.name]: event.target.files[0] });
    }
  };

  maxSelectFile = (event: any) => {
    let files = event.target.files; // create file object
    if (files.length > 1) {
      const msg = "Only 1 images can be uploaded at a time";
      event.target.value = null; // discard selected file
      console.log(msg);
      return false;
    }
    return true;
  };

  checkMimeType = (event: any) => {
    //getting file object
    let files = event.target.files;
    //define message container
    let err = "";
    // list allow mime type
    const types = ["image/png", "image/jpeg", "image/gif"];
    // loop access array
    // compare file type find doesn't matach
    if (types.every((type: any) => files[0].type !== type)) {
      // create error message and assign to container
      err += files[0].type + " is not a supported format\n";
    }

    if (err !== "") {
      // if message not same old that mean has error
      event.target.value = null; // discard selected file
      console.log(err);
      return false;
    }
    return true;
  };

  checkFileSize = (event: any) => {
    let files = event.target.files;
    let size = 15000;
    let err = "";
    for (var x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err += files[x].type + "is too large, please pick a smaller file\n";
      }
    }
    if (err !== "") {
      event.target.value = null;
      console.log(err);
      return false;
    }

    return true;
  };

  submit_image() {
    try {
      this.setState({ loading: true });
      const imgUpload = this.props.firebase.createImages(
        this.state.fileOne,
        this.props.firebase.auth.currentUser["uid"],
        this.state.itemTitle,
        this.state.itemCategory
      );

      imgUpload.then((value: string) => {
        var link_split = value[0].split("/");
        var link_loc = link_split[link_split.length - 1];

        var link_str = link_loc.split("?alt");
        var link_real = link_str[0].replace(/%2F/g, "/");

        this.setState({ uploadedImg: value });
        var lprFunc = this.props.firebase.functions.httpsCallable("lprapi");
        lprFunc({ text: { imgUrl: link_real } })
          .then((result: any) => {
            console.log("Call to function passed...", result.data);
            this.setState({
              lprResult: result.data,
              loading: false,
            });
          })
          .catch(() => {
            console.log("Error has returned when calling the lprapi...");
            this.setState({ loading: false });
          });
      });
    } catch (exception) {
      this.setState({ loading: false });
      console.log("exception", exception);
    }
  }

  componentDidMount() {}
  render() {
    return (
      <>
        <NavResult />
        <div className="div-parent">
          <h1> Upload an image of a License plate to test API </h1>
        </div>
        <div className="input-group">
          <div className="custom-file">
            <input
              name="fileOne"
              type="file"
              className="custom-file-input"
              id="validationDefault05"
              onChange={this.imgOnChange}
              required
            ></input>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm btn-edit"
          onClick={this.submit_image}
        >
          Upload Image...
        </button>

        <div>
          <h2>Result: {this.state.lprResult} </h2>
        </div>
        <div
          className={this.state.loading ? "parentDisable" : ""}
          style={{ width: "100%" }}
        >
          <div className="overlay-box">
            <RingLoader
              // css={override}
              size={35}
              color={"white"}
              loading={this.state.loading}
            />
          </div>
        </div>
      </>
    );
  }
}

export default compose(
  withFirebase,
  withRouter,
  inject("sessionStore"),
  observer
)(Lpr);
