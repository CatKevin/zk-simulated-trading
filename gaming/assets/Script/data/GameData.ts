const { ccclass, property } = cc._decorator;
import { GoodsList, GoodsMarketTips } from "./StaticData";
import NodeData from "./NodeData";
import GoodsItem from "../components/Goods/GoodsItem";

@ccclass
export default class GameData extends cc.Component {
  @property(cc.Node)
  private CashNode: cc.Node = null;

  @property(cc.Node)
  private TotalAssetsNode: cc.Node = null;

  @property(cc.Node)
  private WareNode: cc.Node = null;

  @property(cc.Node)
  private AgeNode: cc.Node = null;

  @property(cc.Node)
  private NextYearBtnNode: cc.Node = null;

  @property(cc.Node)
  private EndGameBtnNode: cc.Node = null;

  @property([cc.SpriteFrame])
  private GoodsSpriteArr: Array<cc.SpriteFrame> = [];

  private LastGoodsMarketData = {};
  private currentGoodsMarketData = {};

  private currentGoodsList = [];
  private myGoodsList = [];
  private myGoodsTypeNum = 0;

  private myCash = 100000;
  private totalAssets = 100000;
  private WareHouseCapcity = 0;
  private totoalWareHouseCapcity = 100;
  private currentAge = 0;
  private totalAge = 10;
  private maxTotoalWareHouseCapcity = 200;

  private eventObj = {
    maxAssets: 0,
    maxAssetsAge: 0,
    firstAge: 0,
    secondAge: 0,
    thirdAge: 0,
    forthAge: 0,
    currentAge: 0,
  };

  initData() {
    console.log("init data");
  }

  start() {
    this.updateGoodsMarketData();
    this.updateGoodsMarketCurrentUI();
    this.eventObj.maxAssets = this.totalAssets;
  }

  expandCapcityByCash() {
    if (this.totoalWareHouseCapcity >= this.maxTotoalWareHouseCapcity) {
      return;
    }
    let cashTmp = Math.floor(this.totalAssets / 2);
    if (this.myCash > cashTmp) {
      this.myCash = this.myCash - cashTmp;
      this.totalAssets = this.totalAssets - cashTmp;
      this.totoalWareHouseCapcity = this.totoalWareHouseCapcity + 10;
      this.CashNode.getComponent(cc.Label).string = this.FormatNum(this.myCash);
      this.TotalAssetsNode.getComponent(cc.Label).string = this.FormatNum(
        this.totalAssets
      );
      this.WareNode.getChildByName("positionNum").getComponent(
        cc.Label
      ).string = this.WareHouseCapcity + "/" + this.totoalWareHouseCapcity;
      return 1;
    } else {
      alert("Not enough cash！")
      return 0;
    }
  }

  flagExpand() {
    if (this.totoalWareHouseCapcity >= this.maxTotoalWareHouseCapcity) {
      return;
    }
  }

  expandCapByETH() {
    this.totoalWareHouseCapcity = this.totoalWareHouseCapcity + 10;
    this.WareNode.getChildByName("positionNum").getComponent(cc.Label).string =
      this.WareHouseCapcity + "/" + this.totoalWareHouseCapcity;
    NodeData.getExpandCapPanelComponent().ClosePanel();
  }

  getUserCurrentAssets() {
    return {
      myCash: this.myCash,
      totalAssets: this.totalAssets,
    };
  }

  leavePanelGetData() {
    return {
      eventObj: this.eventObj,
      totalAssets: this.totalAssets,
    };
  }

  updateEvent(assetsNum) {
    if (assetsNum > 10 ** 9) {
      if (this.eventObj.forthAge == 0) {
        this.eventObj.forthAge = this.currentAge;
      }
    }
    if (assetsNum > 10 ** 8) {
      if (this.eventObj.thirdAge == 0) {
        this.eventObj.thirdAge = this.currentAge;
      }
    }
    if (assetsNum > 10 ** 7) {
      if (this.eventObj.secondAge == 0) {
        this.eventObj.secondAge = this.currentAge;
      }
    }
    if (assetsNum > 10 ** 6) {
      if (this.eventObj.firstAge == 0) {
        this.eventObj.firstAge = this.currentAge;
      }
    }
    if (this.eventObj.maxAssets < assetsNum) {
      this.eventObj.maxAssets = assetsNum;
      this.eventObj.maxAssetsAge = this.currentAge;
    }
    this.eventObj.currentAge = this.currentAge;
    // console.log("########eventObj############")
    // console.log(this.eventObj)
    // console.log("####################")
  }

  resetAllData() {
    this.LastGoodsMarketData = {};
    this.currentGoodsMarketData = {};
    this.currentGoodsList = [];
    this.myGoodsList = [];
    this.myGoodsTypeNum = 0;
    this.WareHouseCapcity = 0;
    this.myCash = 100000;
    this.totalAssets = 100000;
    this.currentAge = 0;
    this.eventObj = {
      maxAssets: 0,
      maxAssetsAge: 0,
      firstAge: 0,
      secondAge: 0,
      thirdAge: 0,
      forthAge: 0,
      currentAge: 0,
    };
  }

  getGobalGoodsSpriteArrItem(goodsId) {
    if (goodsId >= this.GoodsSpriteArr.length) {
      return this.GoodsSpriteArr[0];
    }
    return this.GoodsSpriteArr[goodsId];
  }

  getUserData() {
    return {
      myCash: this.myCash,
      totalAssets: this.totalAssets,
      WareHouseCapcity: this.WareHouseCapcity,
      myGoodsList: this.myGoodsList,
      totoalWareHouseCapcity: this.totoalWareHouseCapcity,
    };
  }

  currentMarketSaleFlag(goodsId) {
    for (let i = 0; i < this.currentGoodsList.length; i++) {
      if (this.currentGoodsList[i].id == goodsId) {
        return 1;
      }
    }
    return 0;
  }

  getBuyFlag(goodsId) {
    let count = 0;
    let inFlag = 0;
    for (let i = 0; i < this.myGoodsList.length; i++) {
      if (this.myGoodsList[i].num > 0) {
        count = count + 1;
      }
      if (this.myGoodsList[i].id == goodsId) {
        inFlag = 1;
      }
    }
    if (inFlag == 1) {
      return 1;
    } else {
      if (count >= 5) {
        return 0;
      } else {
        return 1;
      }
    }
  }

  updateGoodsMarketData() {
    let randomArr = [];
    let count = Math.round(Math.random() * 3) + 3;
    while (randomArr.length < count) {
      let id = Math.round(Math.random() * 7);
      if (this.searchItemInGoodsArr(id, randomArr) == 0) {
        if(id == 1) {
          let btcPrice = this.node.getComponent("web3").getBtcPrice();
          if(!btcPrice){
            btcPrice = 50000;
          }
          let price = Math.round(Math.random() * btcPrice);
          randomArr.push({
            id: id,
            price: price,
          });
        } else {
          let price = Math.round(Math.random() * 15770);
          randomArr.push({
            id: id,
            price: price,
          });
        }
      }
    }

    this.updateGoodsMarketCurrentData(randomArr);
  }

  updateCurrentMarketTips(data) {
    let marketTipArr = [];
    for (let i = 0; i < data.length; i++) {
      let lastPrice = this.LastGoodsMarketData[data[i].id].price;
      if (lastPrice > 0) {
        if (lastPrice > data[i].price) {
          let lineType = 0; // fall
          let markertTip =
            "The market is stable and prices do not fluctuate much";
          let rate = (lastPrice - data[i].price) / lastPrice;
          if (rate > 0.5) {
            markertTip = GoodsMarketTips[data[i].id][3];
          } else {
            markertTip = GoodsMarketTips[data[i].id][2];
          }
          marketTipArr.push({
            id: data[i].id,
            lineType: lineType,
            markertTip: markertTip,
          });
        } else {
          let lineType = 1; // rise
          let markertTip =
            "The market is stable and prices do not fluctuate much";
          let rate = (data[i].price - lastPrice) / lastPrice;
          if (rate > 0.5) {
            markertTip = GoodsMarketTips[data[i].id][0];
          } else {
            markertTip = GoodsMarketTips[data[i].id][1];
          }
          marketTipArr.push({
            id: data[i].id,
            lineType: lineType,
            markertTip: markertTip,
          });
        }
      }
    }
    // update marketTipPanel
    NodeData.getMarketTipPanelComponent().updateMarketTipsList(marketTipArr);
  }

  searchItemInGoodsArr(id, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (id == arr[i].id) {
        return 1;
      }
    }
    return 0;
  }

  // type==0:sell，type==1:bug
  updateMyAssets(goodsId, num, type) {
    let priceTmp = this.currentGoodsMarketData[goodsId].price;
    if (type == 0) {
      //sell
      let index = this.getItemIndexInGoodsArr(goodsId, this.myGoodsList);
      console.log(index);
      console.log(this.myGoodsList);
      console.log(this.myGoodsList[index]);
      let currentNum = this.myGoodsList[index].num;
      if (num <= currentNum) {
        this.myGoodsList[index].num = currentNum - num;
        this.myCash = this.myCash + num * priceTmp;
        this.WareHouseCapcity = this.WareHouseCapcity - num;
        if (num == currentNum) {
          this.myGoodsTypeNum = this.myGoodsTypeNum - 1;
        }
      }
    } else if (type == 1) {
      // bug
      if (this.myCash < priceTmp * num) {
        return;
      } else {
        let cashTmp = this.myCash - priceTmp * num;
        if (cashTmp < 0) return;
        let WareHouseCapcityTmp = this.WareHouseCapcity + num;
        if (WareHouseCapcityTmp > this.totoalWareHouseCapcity) return;
        this.myCash = cashTmp;
        this.WareHouseCapcity = WareHouseCapcityTmp;
        let index = this.getItemIndexInGoodsArr(goodsId, this.myGoodsList);
        if (index >= 0) {
          let currentItem = this.myGoodsList[index];
          let totalNum = currentItem.num + num;
          let rangePriceTmp = Math.ceil(
            (currentItem.num * currentItem.rangePrice + priceTmp * num) /
              totalNum
          );
          this.myGoodsList[index].rangePrice = rangePriceTmp;
          this.myGoodsList[index].num = totalNum;
        } else {
          this.myGoodsTypeNum = this.myGoodsTypeNum + 1;
          this.myGoodsList.push({
            id: goodsId,
            rangePrice: priceTmp,
            num: num,
          });
        }
      }
    }
    this.CashNode.getComponent(cc.Label).string = this.myCash + "";
    this.TotalAssetsNode.getComponent(cc.Label).string = this.totalAssets + "";
    this.WareNode.getChildByName("positionNum").getComponent(cc.Label).string =
      this.WareHouseCapcity + "/" + this.totoalWareHouseCapcity;
    NodeData.getMyGoodsListComponent().updateMyGoodsList(this.myGoodsList);
  }

  getItemIndexInGoodsArr(id, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (id == arr[i].id) {
        return i;
      }
    }
    return -1;
  }

  updateGoodsMarketCurrentData(data) {
    if (this.currentGoodsList.length == 0) {
      for (let i in GoodsList) {
        this.LastGoodsMarketData[i] = {
          id: i,
          price: 0,
        };
      }
    } else {
      // console.log("updateLastGoodsMarketData.. ");
      this.updateLastGoodsMarketData();
    }
    for (let i = 0; i < data.length; i++) {
      this.currentGoodsMarketData[data[i].id] = {
        id: data[i].id,
        price: data[i].price,
      };
    }
    // console.log(this.currentGoodsList)
    // console.log(data)
    // console.log("LastGoodsMarketData:", this.LastGoodsMarketData);
    // console.log("currentGoodsMarketData:",this.currentGoodsMarketData)
    this.currentGoodsList = data;
  }

  calTotalGoodsAssets() {
    let totalGoodsAssets = 0;
    for (let i = 0; i < this.myGoodsList.length; i++) {
      if (this.myGoodsList[i].num > 0) {
        let currentPrice = this.myGoodsList[i].rangePrice;
        for (let k = 0; k < this.currentGoodsList.length; k++) {
          let item = this.currentGoodsList[k];
          if (item.id == this.myGoodsList[i].id) {
            currentPrice = item.price;
          }
        }
        totalGoodsAssets =
          totalGoodsAssets + currentPrice * this.myGoodsList[i].num;
      }
    }
    return totalGoodsAssets;
  }

  refreshMyTotalAssets() {
    let totalGoodsAssets = this.calTotalGoodsAssets();
    this.totalAssets = this.myCash + totalGoodsAssets;
    this.CashNode.getComponent(cc.Label).string = this.FormatNum(this.myCash);
    this.TotalAssetsNode.getComponent(cc.Label).string = this.FormatNum(
      this.totalAssets
    );
    if (this.currentAge + 1 >= this.totalAge) {
      // NodeData.getGameComponent().leaveGame();
      this.NextYearBtnNode.getComponent("GoToNextYearTip").ClosePanel();
      this.EndGameBtnNode.getComponent("EndGameTip").OpenPanel();
    }
    this.currentAge = this.currentAge + 1;
    this.AgeNode.getChildByName("yearNum").getComponent(cc.Label).string =
      this.currentAge + " / " + this.totalAge;
    this.updateEvent(this.totalAssets);
  }

  updateGoodsMarketCurrentUI() {
    this.updateCurrentMarketTips(this.currentGoodsList);
    NodeData.getMarketGoodsListComponent().updateMarketGoodsList(
      this.currentGoodsList
    );
    // update total assets
    this.refreshMyTotalAssets();
  }

  updateLastGoodsMarketData() {
    let tmp = this.currentGoodsList;
    for (let i = 0; i < tmp.length; i++) {
      this.LastGoodsMarketData[tmp[i].id] = {
        id: tmp[i].id,
        price: tmp[i].price,
      };
    }
  }

  getLastMarketGoodsPriceById(GoodsId) {
    return this.LastGoodsMarketData[GoodsId].price;
  }

  getCurrentMarketGoodsPriceById(GoodsId) {
    return this.currentGoodsMarketData[GoodsId].price;
  }

  // Get the previous market price of Goods
  getLastMarketGoodsById(GoodsId) {
    return this.LastGoodsMarketData[GoodsId];
  }

  // Get the current market price of Goods
  getCurrentMarketGoodsById(GoodsId) {
    return this.currentGoodsMarketData[GoodsId];
  }

  getCurrentGoodsList() {
    return this.currentGoodsList;
  }

  getMyGoodsList() {
    return this.myGoodsList;
  }

  getMyCash() {
    return this.myCash;
  }

  FormatNum(num) {
    num = num + "";
    var str = "";
    for (var i = num.length - 1, j = 1; i >= 0; i--, j++) {
      if (j % 3 == 0 && i != 0) {
        str += num[i] + ",";
        continue;
      }
      str += num[i];
    }
    var out = str.split("").reverse().join("");
    if (out[0] == ",") return out.slice(0, 1);
    return out;
  }

  // update (dt) {}
}
