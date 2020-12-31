import { observable, action, computed } from "mobx";

interface appUsers {
  u: any;
  uid: any;
}

class UserStore {
  @observable users: any = {};
  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
  }

  @action setUsers = (users: any) => {
    this.users = users;
  };

  @action setUser = (user: any, uid: any) => {
    if (!this.users) {
      this.users = {};
    }

    this.users[uid] = user;
  };

  @computed get userList() {
    return Object.keys(this.users || {}).map((key) => ({
      ...this.users[key],
      uid: key,
    }));
  }
}

export default UserStore;
