
const {ccclass, property} = cc._decorator;
import NodeData from "../../data/NodeData";

@ccclass
export default class JoinPanel extends cc.Component {

    OpenPanel(){
        this.node.active = true;
    }

    ClosePanel(){
        this.node.active = false;
    }

    joinGame(){
        console.log("Join the game")
    }

    // update (dt) {}
}
