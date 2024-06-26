const { ccclass, property } = cc._decorator;

import NodeData from "./../../data/NodeData";

@ccclass
export default class MyGoodsList extends cc.Component {
    @property(cc.Node)
    private content: cc.Node = null;
  
    @property(cc.Prefab)
    private itemPrefab: cc.Prefab = null;
  
    public updateMyGoodsList(data) {
      if(data.length==0){
        return
      }
      let count = Math.max(data.length, this.content.childrenCount);
      for (let i = 0; i < count; i++) {
        if(data[i].num==0){
          this.content.children[i].active = false;
          continue
        }
        if (data[i] && this.content.children[i]) {
          this.content.children[i].active = true;
          // console.log(data[i])
          this.content.children[i].getComponent("MyGoodsItems").set(data[i].rangePrice, data[i].id,data[i].num);
        } else if (data[i] && !this.content.children[i]) {
          let node = cc.instantiate(this.itemPrefab);
          node.setParent(this.content);
          node.getComponent("MyGoodsItems").set(data[i].rangePrice, data[i].id,data[i].num);
        } else {
          this.content.children[i].active = false;
        }
      }
    }

  // update (dt) {}
}
