import {Color, Component, Label,  Sprite,  tween, Vec3,  _decorator,Node,director, easing, find, NodeEventType} from 'cc';
import { GameController } from './GameController';
import { SceneController } from '../SceneController';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    
    
    @property(Label)
    private TimeText:Label;
    @property(Label)
    private ScoreText:Label;
    @property(Sprite)
    private StrengthenIcon:Sprite;
    
    @property(Sprite)
    private LuckyIcon:Sprite;

    @property(Sprite)
    private RockAppreciateIcon:Sprite;
    
    @property(Sprite)
    private DiamondPolishIcon:Sprite;
    
    @property(Label)
    private ScoreAniLabel:Label;

    @property(Node)
    private FinalScoreBoard:Node;
    @property(Label)
    private FinalScore:Label;
    
    @property(Node)
    private submitButton:Node;

    private ScoreAni:Node;

    private static instance:UIController = null;

    onLoad() {
        //始终要更新ins为this(因为上面挂载了真正的序列化数据)，不是单例模式
        UIController.instance = this;
    }

    start() {
        let ins = UIController.instance;

        ins.LuckyIcon.color = UIController.getColor(
            GameController.getLucky());
        ins.StrengthenIcon.color = UIController.getColor(
            GameController.getStrengthen());
        ins.DiamondPolishIcon.color = UIController.getColor(
            GameController.getDiamondPolish());
        ins.RockAppreciateIcon.color = UIController.getColor(
            GameController.getRockAppreciate());
        ins.ScoreAni = ins.ScoreAniLabel.node;
        
        ins.FinalScoreBoard.active=false;
    }

    private static getColor(isActive:boolean){
        return isActive? Color.WHITE : Color.GRAY;
    }

    public static setTime(time:number){

        if(time<=0){
            return;
        }

        let min=time/60;
        let sec=time%60;
        UIController.instance.TimeText.string = (min<10?"0":"")+Math.floor(min).toString()
        +":"+(sec<10?"0":"")+(sec).toString();
    }

    
    public static setScore(nowScore:number){
        UIController.instance.ScoreText.string = nowScore.toString();
    }


    public static setScoreAni(scoreAdded:number){
        UIController.instance.ScoreAniLabel.string="$"+scoreAdded.toString();

        tween().target(UIController.instance.ScoreAni)
        .to(0,{position:new Vec3(600,1330,0),scale:Vec3.ONE})
        .to(0.2,{position:new Vec3(480,1672,0),scale:new Vec3(2,2,2)})
        .to(0.6,{position:new Vec3(251,1661,0),scale:Vec3.ZERO})
        .call(()=>{
            UIController.setScore(GameController.getPlayerData().money);
        })
        .start();
    }


    //以下是已经封装好的方法
    //提示信息
    public static showToast(msg,duration){  
        duration=isNaN(duration)?3000:duration;  
        var m = document.createElement('div');  
        m.innerHTML = msg;  
        m.style.cssText="font-size: 1.5em;color: rgb(255, 255, 255);background-color: rgba(0, 0, 0, 0.6);padding: 10px 15px;margin: 0 0 0 -75px;border-radius: 4px;position: fixed; top: 50%;left: 50%;width: 150px;text-align: center;";
        document.body.appendChild(m);  
        setTimeout(function() {  
            var d = 0.5;
            m.style.opacity = '0';  
            setTimeout(function() { document.body.removeChild(m) }, d * 1000);  
        }, duration);  
    }

    public static ShowFinalScore(finalScore:number){

        UIController.instance.FinalScoreBoard.active=true;

        UIController.instance.FinalScore.string = finalScore.toString();

        tween().target(UIController.instance.FinalScoreBoard)
        .to(0.5,{position:new Vec3(525,838,0)},{easing:"cubicOut"})
        .call(()=>{
            //还需要UI交互和音效等，因此放弃pause
            //director.pause();
        })
        .start();
    }

    //某项数值不足的提示
    public static redWarning(icon:Sprite){
        icon.color = Color.RED;
        let interval:number = 100;
        let count:number = 0;

        let temp = setInterval(()=>{
            count++;
            icon.color = count%2==1?Color.WHITE:Color.RED;
            if(count >= 5){
                clearInterval(temp);
                icon.color=Color.WHITE;
            }
        },interval);
    }
}

