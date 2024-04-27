const { ccclass, property } = cc._decorator;
const Web3 = require("web3/dist/web3.min.js");

import NodeData from "./../../data/NodeData";


@ccclass
export default class Web3Class extends cc.Component {
  public currentAccount = null;

    async onLoad() {
      await this.InitWeb3();
    }

  async InitWeb3() {
    // TODO
  }

  async StartGame() {
    // TODO
    cc.director.loadScene('game');
  }

  async ExpandCap() {
    // TODO
    NodeData.getGameDataComponent().expandCapcityByETH()
  }

    async getTopPlayerCall() {
      // TODO
    }

    async totalBlockCall() {
     // TODO
    }

    async getRankData(){
      // TODO
      let data = {
        block:"BLOCK:0",
        address:"ADDRESS:0x00000000000001",
        grade:"Grade:99325525"
      }
      return data;
    }

  async postGrade(grade) {
    // TODO
    NodeData.getGameDataComponent().resetAllData()
    NodeData.getLeavePanelComponent().ClosePanel();
  }
}
