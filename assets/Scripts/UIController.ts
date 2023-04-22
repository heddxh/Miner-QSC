import { CCObject, Color, Component, Game, Label,  Sprite,  _decorator } from 'cc';
import { GameManager } from './GameManager';
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
    
    private static instance:UIController = null;

    onLoad() {
        if(UIController.instance == null){
            UIController.instance = this;
        }else return;

    }

    start() {
        UIController.instance.LuckyIcon.color = UIController.getColor(
            GameManager.getLucky());
        UIController.instance.StrengthenIcon.color = UIController.getColor(
            GameManager.getStrengthen());
        UIController.instance.DiamondPolishIcon.color = UIController.getColor(
            GameManager.getDiamondPolish());
        UIController.instance.RockAppreciateIcon.color = UIController.getColor(
            GameManager.getRockAppreciate()); 
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

}

