import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import NavResult from "../Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

class Api extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
    };
  }

  render() {
    return (
      <>
        <NavResult />

        <div className="card" style={{ width: "18rem" }}>
          <img className="card-img-top" src="..." alt="The Api cards"></img>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
            <li>
              <Link to={ROUTES.LPR_API}>Try it Now!</Link>
            </li>
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
)(Api);
