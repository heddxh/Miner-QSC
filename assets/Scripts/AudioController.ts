import { _decorator, Component, Node, director, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    
    @property(AudioClip)
    private buttonClick:AudioClip=null;
    @property(AudioClip)
    private timeOut:AudioClip=null;
    @property(AudioClip)
    private gameOver:AudioClip=null;
    

    @property(AudioClip)
    private tntBomb:AudioClip=null;
    @property(AudioClip)
    private roofBomb:AudioClip=null;
    @property(AudioClip)
    private rope:AudioClip=null;
    @property(AudioClip)
    private bonus:AudioClip=null;

    @property(AudioClip)
    private catchGold:AudioClip=null;
    @property(AudioClip)
    private catchDiamond:AudioClip=null;
    
    @property(AudioClip)
    private stone:AudioClip=null;
    @property(AudioClip)
    private hookOut:AudioClip=null;
    
    @property(AudioClip)
    private buyItem:AudioClip=null;
    
    //游戏音效,含于当前节点中
    @property(AudioSource)
    private gameAudio:AudioSource;

    //UI音效，只能含于另一个节点中
    @property(AudioSource)
    private UIAudio:AudioSource;

    private static instance:AudioController;
    
    start() {
        this.gameAudio.loop=false;
        //持久化音频播放节点，game和UI
        director.addPersistRootNode(this.node);
        director.addPersistRootNode(this.UIAudio.node);
        AudioController.instance=this;
    }

    //提供播放UI音频的函数
    public static playButtonClick(){
        AudioController.instance.UIAudio.clip=
            AudioController.instance.buttonClick;
        AudioController.instance.UIAudio.play();
    }

    public static playTimeOut(){
        AudioController.instance.UIAudio.clip=
            AudioController.instance.timeOut;
        AudioController.instance.UIAudio.play();
    }

    public static playGameOver(){
        AudioController.instance.UIAudio.clip=
            AudioController.instance.gameOver;
        AudioController.instance.UIAudio.play();
    }
    //提供播放game音频的函数
    public static playTNTBomb(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.tntBomb;
        AudioController.instance.gameAudio.play();
    }
    public static playRope(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.rope;
        AudioController.instance.gameAudio.play();
    }
    public static playRoofBomb(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.roofBomb;
        AudioController.instance.gameAudio.play();
    }

    public static playBonus(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance. bonus;
        AudioController.instance.gameAudio.play();
    }

    public static playCatchGold(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.catchGold;
        AudioController.instance.gameAudio.play();
    }

    public static playCatchDiamond(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.catchDiamond;
        AudioController.instance.gameAudio.play();
    }

    public static playStone(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.stone;
        AudioController.instance.gameAudio.play();
    }

    public static playHookOut(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.hookOut;
        AudioController.instance.gameAudio.play();
    }

    public static playBuyItem(){
        AudioController.instance.gameAudio.clip=
            AudioController.instance.buyItem;
        AudioController.instance.gameAudio.play();
    }
    

}

