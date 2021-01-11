import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavResult from "../Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

class Home extends Component<
  { firebase: any; history: any; sessionStore: any },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
    };
  }
  componentDidMount() {
    console.log(
      "What is the value of sessions",
      this.props.sessionStore.authUser
    );
  }
  render() {
    return (
      <>
        <NavResult />
      </>
    );
  }
}

export default compose(
  withFirebase,
  withRouter,
  inject("sessionStore"),
  observer
)(Home);
