
const {ccclass, property} = cc._decorator;

import NodeData from "./../data/NodeData";

@ccclass
export default class Game extends cc.Component {

    getNextYaerMarketData(){
        NodeData.getGameDataComponent().updateGoodsMarketData()
    }

        
    createProof(onOK?: Function) {
        // TODO
        // just update market data
        NodeData.getGameDataComponent().updateGoodsMarketData();
        let currentGoodsList = NodeData.getGameDataComponent().getCurrentGoodsList();
        let myGoodsList = NodeData.getGameDataComponent().getMyGoodsList();
        let totalGoodsAssets = NodeData.getGameDataComponent().calTotalGoodsAssets();
        let myCash = NodeData.getGameDataComponent().getMyCash();
        // console.log('currentGoodsList:', currentGoodsList);
        // console.log('myGoodsList:', myGoodsList);
        // console.log('totalGoodsAssets:', totalGoodsAssets);
        // console.log('myCash:', myCash);
        const proof_input = '{"X": 32, "Y": 32}';
        // onOK: update UI
        this.node.getComponent("web3").createProof(proof_input, onOK);
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
