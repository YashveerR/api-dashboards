import React from "react";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const withAuthorization = (condition: any) => (Component: any) => {
  class WithAuthorization extends React.Component<any, any> {
    listener: any;
    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        (authUser: any) => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.SIGN_IN);
          }
        },
        () => this.props.history.push(ROUTES.SIGN_IN)
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return condition(this.props.sessionStore.authUser) ? (
        <Component {...this.props} />
      ) : null;
    }
  }

  return compose(
    withRouter,
    withFirebase,
    inject("sessionStore"),
    observer
  )(WithAuthorization);
};

export default withAuthorization;
