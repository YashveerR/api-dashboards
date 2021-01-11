import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { withFirebase } from "../Firebase";

const withAuthentication = (Component: any) => {
  class WithAuthentication extends React.Component<any, any> {
    listener: any;
    constructor(props: any) {
      super(props);
      console.log(
        "Checking the authuser in local storage ",
        localStorage.getItem("authUser")
      );
      this.props.sessionStore.setAuthUser(
        JSON.parse(localStorage.getItem("authUser") || "{}")
      );
    }

    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        (authUser: any) => {
          localStorage.setItem("authUser", JSON.stringify(authUser));
          localStorage.removeItem("lockIds");
          localStorage.removeItem("paymentId");
          this.props.sessionStore.setAuthUser(authUser);
          console.log("Firebase user checked out");
          console.log(
            "Session stores within with Auth",
            this.props.sessionStore.authUser
          );
        },
        () => {
          localStorage.removeItem("authUser");
          this.props.sessionStore.setAuthUser(null);
          console.log("Firebase user deleted");
          console.log(
            "Session stores within withauth no user",
            this.props.sessionStore.authUser
          );
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  return compose(
    withRouter,
    withFirebase,
    inject("sessionStore"),
    observer
  )(WithAuthentication);
};

export default withAuthentication;
