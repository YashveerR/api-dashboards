import { observable, action, computed } from "mobx";

class MessageStore {
  @observable messages: any = null;
  @observable limit = 5;
  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
  }

  @action setMessages = (messages: any) => {
    this.messages = messages;
  };

  @action setLimit = (limit: any) => {
    this.limit = limit;
  };

  @computed get messageList() {
    return Object.keys(this.messages || {}).map((key) => ({
      ...this.messages[key],
      uid: key,
    }));
  }
}

export default MessageStore;
