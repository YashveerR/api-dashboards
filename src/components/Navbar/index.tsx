import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import * as ROUTES from "../../constants/routes";
import NavDropdown from "react-bootstrap/NavDropdown";

import "./navbar.css";
import { Link, withRouter } from "react-router-dom";

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
};

class NavResult extends React.Component<{ firebase: any; history: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      allowed: false,
    };
  }

  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        this.setState({ allowed: true });
      }
    });
  }
  render() {
    return <>{this.state.allowed ? <NavBarComp /> : <NavBarNoAuth />}</>;
  }
}

class NavBars extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showCartView: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.firebase.doSignOut();
    this.props.itemStore.empty();
  }

  render() {
    return (
      <>
        <div>
          <Navbar>
            <Navbar.Brand href="/">API Playground</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav className="mr-auto"></Nav>
              <Nav className="justify-content-end">
                <NavDropdown title="My Account" id="basic-nav-dropdown">
                  <Nav.Link as={Link} to={ROUTES.ACCOUNT}>
                    Account
                  </Nav.Link>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={this.handleClick}
                    href="/"
                    eventKey="info"
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </>
    );
  }
}

class NavBarsNoAuth extends React.Component<
  { firebase: any; history: any },
  any
> {
  element: any;
  constructor(props: any) {
    super(props);
    this.state = {
      showSignIn: false,
      showCartView: false,
      ...INITIAL_STATE,
      switchView: false,
    };
    this.element = React.createRef();
  }
  onSubmit = (event: any) => {
    const { email, password } = this.state;

    console.log("about to sing in ");
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        //this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch((error: any) => {
        console.log("error received", error);
        this.setState({ error });
      });

    event.preventDefault();
  };

  onRequest = (event: any) => {
    const { email, password } = this.state;

    //here we will call the firebase function to send a request to access the API's
  };

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";
    return (
      <>
        <div>
          <Navbar>
            <Navbar.Brand href="/">API Playground</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav className="mr-auto"></Nav>
              <Nav className="justify-content-end">
                <Nav.Link
                  onClick={() => console.log("Button was clicked herer")}
                  data-toggle="modal"
                  data-target="#loginModalLong"
                >
                  Enter Playground Yellows
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
        <div
          className="modal fade  preview-modal"
          id="loginModalLong"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="loginModalLong"
          aria-hidden="true"
          ref={this.element}
          data-backdrop=""
        >
          <div className="modal-dialog " role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Login
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    this.setState({ switchView: false });
                  }}
                >
                  {" "}
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {this.state.switchView ? (
                  <form onSubmit={this.onRequest}>
                    <input
                      name="email"
                      value={email}
                      onChange={this.onChange}
                      type="email"
                      placeholder="Email Address"
                    />
                    <input
                      name="password"
                      value={password}
                      onChange={this.onChange}
                      type="password"
                      placeholder="Password"
                    />
                  </form>
                ) : (
                  <form onSubmit={this.onSubmit}>
                    <input
                      name="email"
                      value={email}
                      onChange={this.onChange}
                      type="email"
                      placeholder="Email Address"
                    />
                    <input
                      name="password"
                      value={password}
                      onChange={this.onChange}
                      type="password"
                      placeholder="Password"
                    />
                    <button
                      className="submitBtn btn"
                      disabled={isInvalid}
                      type="submit"
                    >
                      Sign In
                    </button>

                    {error && <p>{error.message}</p>}
                  </form>
                )}
              </div>
              <div className="modal-footer">
                {this.state.switchView ? (
                  <button className="btn btn-secondary btn-lg active">
                    Send Request
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary btn-lg active"
                    onClick={() => this.setState({ switchView: true })}
                  >
                    Request Access
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const NavBarComp = compose(
  withRouter,
  withFirebase,
  inject("itemStore"),
  observer
)(NavBars);
const NavBarNoAuth = compose(
  withRouter,
  withFirebase,
  inject("itemStore"),
  observer
)(NavBarsNoAuth);

export default compose(
  withFirebase,
  inject("sessionStore"),
  observer
)(NavResult);
