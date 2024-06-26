const { ccclass, property } = cc._decorator;

import NodeData from "./../../data/NodeData";

@ccclass
export default class MarketGoodsList extends cc.Component {
    @property(cc.Node)
    private content: cc.Node = null;
  
    @property(cc.Prefab)
    private itemPrefab: cc.Prefab = null;
  
    public updateMarketGoodsList(data) {
      if(data.length==0){
        return
      }
      let count = Math.max(data.length, this.content.childrenCount);
      for (let i = 0; i < count; i++) {
        if (data[i] && this.content.children[i]) {
          this.content.children[i].active = true;
          this.content.children[i].getComponent("GoodsItem").set(data[i].price, data[i].id);
        } else if (data[i] && !this.content.children[i]) {
          let node = cc.instantiate(this.itemPrefab);
          node.setParent(this.content);
          node.getComponent("GoodsItem").set(data[i].price, data[i].id);
        } else {
          this.content.children[i].active = false;
        }
      }
    }

  // update (dt) {}
}
