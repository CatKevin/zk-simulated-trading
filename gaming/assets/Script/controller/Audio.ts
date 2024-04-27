
const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioClass extends cc.Component {

    @property({ type: cc.AudioClip })
    backgroundMusic: cc.AudioClip = null;

    protected bgmObj;

    start () {
        this.initMusic();
    }

    initMusic(){
        this.bgmObj = cc.audioEngine.playMusic(this.backgroundMusic, true);
    }
}
