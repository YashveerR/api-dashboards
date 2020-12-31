import { autorun, observable, action, computed, configure } from "mobx";

configure({ enforceActions: "always" });

class ItemStore {
  @observable itemList: any[] = [];
  @observable listError: any = "";
  @observable basketTotal: number = 0;
  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
    this.load();
    autorun(this.save);
  }

  @action addItems = (
    items: any,
    startDate: Date,
    endDate: Date,
    dbID: any
  ) => {
    //Check if an item with the same title is
    let itemCheck = this.itemList.find((item) => {
      return (
        item[0].Title === items.Title &&
        item[0].author === items.author &&
        Date.parse(item[2]) >= startDate.getTime()
      );
    });

    if (itemCheck) {
      this.listError = "duplicate item";
    } else {
      this.itemList.push([items, startDate, endDate, dbID]);
      this.listError = "none";
      this.basketTotal +=
        parseInt(items.Price) *
        (Math.abs(new Date(endDate).valueOf() - new Date(startDate).valueOf()) /
          86400000 +
          1);
    }
  };

  @computed get getItems() {
    return Object.keys(this.itemList || {}).map((key: any) => ({
      ...this.itemList[key],
      uid: key,
    }));
  }

  private save = () =>
    window.localStorage.setItem(
      ItemStore.name,
      JSON.stringify({
        itemList: this.itemList,
      })
    );

  @action empty = () => {
    window.localStorage.removeItem(ItemStore.name);

    this.itemList.length = 0; //empty the array
    this.basketTotal = 0;
  };

  @action removeItem = (index: number) => {
    this.basketTotal -=
      parseInt(this.itemList[index][0].Price) *
      (Math.abs(
        new Date(this.itemList[index][2]).valueOf() -
          new Date(this.itemList[index][1]).valueOf()
      ) /
        86400000 +
        1);
    this.itemList.splice(index, 1);
  };

  private total = () => {
    this.basketTotal = 0;
    this.itemList.forEach((data: any) => {
      this.basketTotal +=
        parseInt(data[0].Price) *
        (Math.abs(new Date(data[2]).valueOf() - new Date(data[1]).valueOf()) /
          86400000 +
          1);
    });
  };

  @action
  private load = () => {
    Object.assign(
      this,
      JSON.parse(window.localStorage.getItem(ItemStore.name) || "{}")
    );
    this.total();
  };
}

export default ItemStore;
