import { CCObject, Component, Game, Label,  _decorator } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    
    
    @property(Label)
    private TimeText:Label;
    @property(Label)
    private ScoreText:Label;
    
    private static instance:UIController = null;

    onLoad() {
        if(UIController.instance == null){
            UIController.instance = this;
        }else return;
        
        
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

