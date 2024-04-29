
const {ccclass, property} = cc._decorator;

import NodeData from "./../data/NodeData";

@ccclass
export default class Game extends cc.Component {

    getNextYaerMarketData(){
        NodeData.getGameDataComponent().updateGoodsMarketData()
    }

    async verifyProofOnContract(onOk?:Function){
        let totalGoodsAssets = NodeData.getGameDataComponent().calTotalGoodsAssets();
        let myCash = NodeData.getGameDataComponent().getMyCash();
        let totalAssets = totalGoodsAssets + myCash;
        await this.node.getComponent("web3").verifyProof(totalAssets, onOk);
    }

        
    createProof(onOK?: Function) {
        // just update market data
        let price = [0,0,0,0,0,0,0,0];
        let positions = [0,0,0,0,0,0,0,0,]
        NodeData.getGameDataComponent().updateGoodsMarketData();
        let currentGoodsList = NodeData.getGameDataComponent().getCurrentGoodsList();
        let myGoodsList = NodeData.getGameDataComponent().getMyGoodsList();
        let totalGoodsAssets = NodeData.getGameDataComponent().calTotalGoodsAssets();
        let myCash = NodeData.getGameDataComponent().getMyCash();
        // console.log('currentGoodsList:', currentGoodsList)
        // console.log('myGoodsList:', myGoodsList)
        // console.log('totalGoodsAssets:', totalGoodsAssets)
        // console.log('myCash:', myCash)
        // console.log('total-game:', totalGoodsAssets + myCash)
        for(let i=0; i<currentGoodsList.length;i++){
            let item = currentGoodsList[i];
            price[item['id']] = item['price'];
        }
        for(let i=0; i<myGoodsList.length;i++){
            let item = myGoodsList[i];
            if(price[item['id']] == 0) {
                price[item['id']] = item['rangePrice'];
            }
            positions[item['id']] = item['num'];
        }

        const proof_input_obj = {
            "price": price,
            "positions": positions,
            "cash": myCash,
            "total": totalGoodsAssets + myCash,
        }
        console.log(proof_input_obj)

        const proof_input = JSON.stringify(proof_input_obj);
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
        this.node.getComponent("web3").gameOver(grade.totalAssets);
    }

    expandByETH(){
        NodeData.getGameDataComponent().flagExpand();
        this.node.getComponent("web3").ExpandCap();
    }
    // update (dt) {}
}
