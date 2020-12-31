import { observable, action } from "mobx";

class SessionStore {
  @observable authUser = null;
  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
  }

  @action setAuthUser = (authUser: any) => {
    this.authUser = authUser;
  };
}

export default SessionStore;
