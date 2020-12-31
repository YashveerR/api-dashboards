import SessionStore from "./sessionStore";
import UserStore from "./userStore";
import MessageStore from "./messageStore";
import ItemStore from "./itemStore";

class RootStore {
  public sessionStore: SessionStore;
  public userStore: UserStore;
  public messageStore: MessageStore;
  public itemStore: ItemStore;

  constructor() {
    this.sessionStore = new SessionStore(this);
    this.userStore = new UserStore(this);
    this.messageStore = new MessageStore(this);
    this.itemStore = new ItemStore(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
