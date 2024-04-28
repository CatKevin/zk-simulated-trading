
const {ccclass, property} = cc._decorator;
import NodeData from "../../data/NodeData";

@ccclass
export default class ClockTip extends cc.Component {

    @property(cc.Animation)
    private ClockAnima: cc.Animation;

    PlayAnima(){
        this.ClockAnima.play("clock");
        // this.ClockEnd();
        NodeData.getGameComponent().createProof(() => this.ClockEnd());
    }

    ClockEnd(){
        this.node.active = false;
        console.log("clock end....")
        // update UI( new data is complete before update UI)
        NodeData.getGameDataComponent().updateGoodsMarketCurrentUI();
        // NodeData.getGameDataComponent().updateGoodsMarketData();
        // cc.director.GlobalEvent.emit(cc.Mgr.Event.ClockEnd, {});
    }
}
