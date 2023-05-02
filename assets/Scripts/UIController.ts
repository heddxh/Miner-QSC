import {Color, Component, Label,  Sprite,  tween, Vec3,  _decorator,Node,director, easing, find} from 'cc';
import { GameController } from './GameController';
import { SceneController } from './SceneController';
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

    private ScoreAni:Node;

    private static instance:UIController = null;

    onLoad() {
        if(UIController.instance == null){
            UIController.instance = this;
        }else return;

    }

    start() {
        UIController.instance.LuckyIcon.color = UIController.getColor(
            GameController.getLucky());
        UIController.instance.StrengthenIcon.color = UIController.getColor(
            GameController.getStrengthen());
        UIController.instance.DiamondPolishIcon.color = UIController.getColor(
            GameController.getDiamondPolish());
        UIController.instance.RockAppreciateIcon.color = UIController.getColor(
            GameController.getRockAppreciate());
        UIController.instance.ScoreAni = UIController.instance.ScoreAniLabel.node;
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
            GameController.setProfit(scoreAdded);
        })
        .start();
    }

    public static ShowFinalScore(finalScore:number){
        
        UIController.instance.FinalScore.string = finalScore.toString();

        tween().target(UIController.instance.FinalScoreBoard)
        .to(0.5,{position:new Vec3(525,838,0)},{easing:"cubicOut"})
        .call(()=>{
            //还需要UI交互
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

