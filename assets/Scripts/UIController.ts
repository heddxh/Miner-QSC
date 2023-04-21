import { CCObject, Component, Game, Label,  _decorator } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    
    
    @property(Label)
    private TimeText:Label;
    @property(Label)
    private ScoreText:Label;

    private leftTime:number;
    
    private static instance:UIController = null;

    start() {
        if(UIController.instance == null){
            UIController.instance = this;
        }else return;
        
        this.leftTime=GameManager.getTotalTime();
        
        
        this.setTime();
        this.schedule(this.setTime,1);
    }


    setTime(){
        this.leftTime--;
        if(this.leftTime<=0){
            //调用GameManager游戏结束函数
            GameManager.gameOver();
            this.unschedule(this.setTime);
        }

        let min=this.leftTime/60;
        let sec=this.leftTime%60;
        this.TimeText.string = (min<10?"0":"")+Math.floor(min).toString()
        +":"+(sec<10?"0":"")+(sec).toString();
    }

    
    public static setScore(nowScore:number){
        UIController.instance.ScoreText.string = nowScore.toString();
    }
}

