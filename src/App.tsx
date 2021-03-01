import "./App.css";
import React from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "../src/components/Home";
import { withAuthentication } from "../src/components/Session";
import * as ROUTES from "../src/constants/routes";
import Api from "./components/Api";
import Lpr from "./components/Lpr";

function App() {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path={ROUTES.DASHBOARD} component={Api} />
      <Route path={ROUTES.LPR_API} component={Lpr} />
    </Switch>
  );
}

export default withAuthentication(App);
