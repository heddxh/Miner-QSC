import { Component, _decorator } from 'cc';
import { UIController } from './UIController';
const { ccclass, property } = _decorator;


@ccclass('GameManager')
export class GameManager extends Component{

    @property
    private totalTime:number = 120;
    
    @property({group:{name:"关卡设计"},type:Array})

    private score:number;
    
    private level:number;
    
    //技能数据
    private TNTNum:number;

    private static instance:GameManager = null;

    
    onLoad() {
        if(GameManager.instance==null){
            //重开新游戏
            this.score=0;
            this.level=1;
            this.TNTNum=10;

            GameManager.instance = this;
        }else{
            //进入下一关
            this.level+=1;

        }
        
    }

    public static getTotalTime():number{
        return GameManager.instance.totalTime;
    }

    //继承上一关的分数
    public static getScore():number{
        return GameManager.instance.score;
    }

    public static setProfit(profit:number){
        GameManager.instance.score+=profit;
        UIController.setScore(GameManager.instance.score);
    }

    //游戏结束，总分结算
    public static gameOver(){

    }

    public static getTNTNum():number{
        return GameManager.instance.TNTNum;
    }

    public static setTNTNum(num:number){
        GameManager.instance.TNTNum=num;
    }


    update(deltaTime: number) {

    }
}

