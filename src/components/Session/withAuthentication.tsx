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
      console.log(localStorage.getItem("authUser"));
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
        },
        () => {
          localStorage.removeItem("authUser");
          this.props.sessionStore.setAuthUser(null);
          console.log("Firebase user deleted");
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
