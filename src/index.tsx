import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "mobx-react";
import store from "./stores";
import * as serviceWorker from "./serviceWorker";

import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <React.StrictMode>
    <Provider {...store}>
      <FirebaseContext.Provider value={new Firebase()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseContext.Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
