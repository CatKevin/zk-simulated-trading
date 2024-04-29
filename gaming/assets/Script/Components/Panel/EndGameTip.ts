
const {ccclass, property} = cc._decorator;
import NodeData from "../../data/NodeData";

@ccclass
export default class EndGameTip extends cc.Component {

    OpenPanel(){
        this.node.active = true;
    }

    ClosePanel(){
        this.node.active = false;
    }

    endGame(){
        NodeData.getGameComponent().leaveGame();
    }

    // update (dt) {}
}
