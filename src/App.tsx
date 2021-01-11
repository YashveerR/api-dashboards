import "./App.css";
import React from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "../src/components/Home";
import { withAuthentication } from "../src/components/Session";

function App() {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
    </Switch>
  );
}

export default withAuthentication(App);
