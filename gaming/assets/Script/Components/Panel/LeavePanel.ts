
const {ccclass, property} = cc._decorator;
import NodeData from "../../data/NodeData";

@ccclass
export default class LeavePanel extends cc.Component {

    @property(cc.RichText)
    richTextObj: cc.RichText;

    parseYear(year) {
        switch(year){
            case 1:
                return "1st";
            case 2:
                return "2nd";
            case 3:
                return "3rd";
            default:
                return year + "th";
        }
    }

    setRichTextObj(dataArr){
        let userData = NodeData.getGameDataComponent().leavePanelGetData()
        let data = `<color=#FF0033><b><outline color=white width=2>In the 1st year, </outline></b></color>`
        + `<color=white><b><outline color=black width=2>get initial capital from Scroll investment: </outline></b></color>`
        + `<color=#FF0033><b><outline color=#FFFF00 width=2>$100,000</outline></b></color><br/>`;
        if(userData.eventObj.firstAge>0){
            data = data + `<color=#FF0033><b><outline color=white width=2>In the `+ this.parseYear(userData.eventObj.firstAge) + ` year, </outline></b></color>`
            + `<color=white><b><outline color=black width=2>become a millionaire with total assets exceeding </outline></b></color>`
            + `<color=#FF0033><b><outline color=#FFFF00 width=2>$1000,000</outline></b></color><br/>`;
            if(userData.eventObj.secondAge>0){
                data = data + `<color=#FF0033><b><outline color=white width=2>In the `+ this.parseYear(userData.eventObj.secondAge) + ` year, </outline></b></color>`
                + `<color=white><b><outline color=black width=2>become a multi-millionaire with total assets exceeding </outline></b></color>`
                + `<color=#FF0033><b><outline color=#FFFF00 width=2>$10,000,000</outline></b></color><br/>`;
                if(userData.eventObj.thirdAge>0){
                    data = data + `<color=#FF0033><b><outline color=white width=2>In the `+ this.parseYear(userData.eventObj.thirdAge) + ` year, </outline></b></color>`
                    + `<color=white><b><outline color=black width=2>,after many difficulties, he finally became </outline></b></color>`
                    + `<color=#FF0033><b><outline color=#FFFF00 width=2>a billionaire！</outline></b></color><br/>`;
                    if(userData.eventObj.forthAge>0){
                        data = data + `<color=#FF0033><b><outline color=white width=2>In the `+ this.parseYear(userData.eventObj.forthAge) + ` year, </outline></b></color>`
                        + `<color=white><b><outline color=black width=2>started to list on Forbes rich list, total assets exceeded </outline></b></color>`
                        + `<color=#FF0033><b><outline color=#FFFF00 width=2>$1000,000,000</outline></b></color><br/>`;
                    }
                }
            }
        }
        data = data  +  `<color=#FF0033><b><outline color=white width=2>In the `+this.parseYear(userData.eventObj.currentAge)+` year, </outline></b></color>`
        + `<color=white><b><outline color=black width=2>you exit the market! Total assets are </outline></b></color>`
        + `<color=#FF0033><b><outline color=#FFFF00 width=2>$`+this.FormatNum(userData.totalAssets)+`</outline></b></color><br/><br/>`;
        data = data  +  `<color=#FF0033><b><outline color=white width=2>Looking back on the entire life journey, starting a business is not easy!</outline></b></color>`
        + `<color=white><b><outline color=black width=2>In the `+this.parseYear(userData.eventObj.maxAssetsAge)+` year, total assets peak at</outline></b></color>`
        + `<color=#FF0033><b><outline color=#FFFF00 width=2>$`+this.FormatNum(userData.eventObj.maxAssets)+`</outline></b></color><br/>`;
        this.richTextObj.string = data;
        this.OpenPanel()
    }


    FormatNum(num){
        num = num +'';
        var str = "";
        for(var i=num.length- 1,j=1;i>=0;i--,j++){  
            if(j%3==0 && i!=0){
                str+=num[i]+",";
                continue;  
            }  
            str+=num[i];
        }  
        var out = str.split('').reverse().join("");
        if(out[0] == ',')
            return out.slice(0,1)
        return out;
    }

    OpenPanel(){
        this.node.active = true;
    }

    ClosePanel(){
        this.node.active = false;
        cc.director.loadScene('loading');
    }

    // update (dt) {}
}
