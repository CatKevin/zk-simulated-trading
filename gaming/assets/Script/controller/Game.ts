
const {ccclass, property} = cc._decorator;

import NodeData from "./../data/NodeData";

@ccclass
export default class Game extends cc.Component {

    getNextYaerMarketData(){
        NodeData.getGameDataComponent().updateGoodsMarketData()
    }

    openMarketTipListPanel(){
        NodeData.getMarketTipPanelComponent().openNode();
    }

    leaveGame(){
        console.log("leave game!")
        // reset data
        let dataArr = []
        NodeData.getLeavePanelComponent().setRichTextObj(dataArr)
        // NodeData.getGameDataComponent().resetAllData()
        
    }

    openExpandPanel(){
        NodeData.getExpandCapcityPanelComponent().openPanel();
    }

    returnToLoading(){
        let grade =  NodeData.getGameDataComponent().getUserCurrentAssets()
        this.node.getComponent("web3").postGrade(grade.totalAssets);
    }

    expandByETH(){
        NodeData.getGameDataComponent().flagExpand();
        this.node.getComponent("web3").ExpandCap();
    }
    // update (dt) {}
}
