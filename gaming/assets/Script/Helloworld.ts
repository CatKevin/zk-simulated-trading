const {ccclass, property} = cc._decorator;

const Web3 = require("web3/dist/web3.min.js");

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;


    start () {
        let version = Web3.version;
        console.log(version)
        // this.label.string = "web3:" + version;
    }
}
