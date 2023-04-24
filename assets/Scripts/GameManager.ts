import { Component, director,game,Game,_decorator,instantiate,Prefab,find,Node, Label} from 'cc';
import { UIController } from './UIController';
const { ccclass, property } = _decorator;


@ccclass('GameManager')
export class GameManager extends Component{
    
    //获取常驻节点和节点上的脚本
    private PlayerDataNode=find("PlayerData");
    

    @property({type:Prefab})
    private description: Prefab = null;

    @property
    private totalTime:number = 120;
    
    private leftTime:number;

    @property({group:{name:"关卡设计"},type:Array})

    private score:number;
    
    private level:number;
    
    //技能数据
    public TNTNum:number;
    public isDiamondPolish:boolean;
    public isStrengthen:boolean;
    public isLucky:boolean;
    public isRockAppreciate:boolean;

    private static instance:GameManager = null;

    onLoad() {
        let PD=this.PlayerDataNode.getComponent("PlayerData")
        this.setUserName();
        if(GameManager.instance==null){
            //重开新游戏
            this.score=0;
            this.level=1;
            this.TNTNum=PD.TNTNum;
            this.isDiamondPolish=PD.isDiamondPolish;
            this.isLucky=PD.isLucky;
            this.isStrengthen=PD.isStrengthen;
            this.isRockAppreciate=PD.isRockAppreciate;
            GameManager.instance = this;
            
        }else{
            //进入下一关，关卡开始时进行技能使用
            GameManager.instance.level+=1;
        }
        //等待任务发布的时间后开始游戏
        GameManager.instance.leftTime=GameManager.instance.totalTime;
        UIController.setTime(GameManager.instance.totalTime);

        GameManager.instance.schedule(GameManager.instance.setTime,1);
        
    }

    setUserName(){
        let PD=this.PlayerDataNode.getComponent("PlayerData")
        let scene=director.getScene();
        let node=scene.getChildByName("Canvas").getChildByName("UIDashBoard").getChildByName("IdBoard").getChildByName("Id");
        node.getComponent(Label).string=PD.UserName;
    }

    public static getTotalTime():number{
        return GameManager.instance.totalTime;
    }

    //继承上一关的分数
    public static getScore():number{
        return GameManager.instance.score;
    }

    private setTime(){
        GameManager.instance.leftTime--;
        if(GameManager.instance.leftTime <= 0){
            this.unschedule(this.setTime);
            GameManager.gameOver();
            return;
        }
        UIController.setTime(GameManager.instance.leftTime);
    }

    public static setProfit(profit:number){
        GameManager.instance.score+=profit;
        UIController.setScore(GameManager.instance.score);
    }

    public static getTNTNum():number{
        return GameManager.instance.TNTNum;
    }

    public static setTNTNum(num:number){
        GameManager.instance.TNTNum=num;
    }

    public static setDiamondPolish(){
        GameManager.instance.isDiamondPolish = true;
    }

    
    public static getDiamondPolish():boolean{
        return GameManager.instance.isDiamondPolish;
    }

    public static setLucky(){
        GameManager.instance.isLucky = true;
    }

    
    public static getLucky():boolean{
        return GameManager.instance.isLucky;
    }
    
    public static setRockAppreciate(){
        GameManager.instance.isRockAppreciate = true;
    }

    public static getRockAppreciate():boolean{
        return GameManager.instance.isRockAppreciate;
    }

    public static setStrengthen(){
        GameManager.instance.isStrengthen = true;
    }
    
    public static getStrengthen():boolean{
        return GameManager.instance.isStrengthen;
    }

    //查看水产介绍，停止计时
    private seeIntroduction(event,args){
        let scene = director.getScene();
        let parentnode=scene.getChildByName("Canvas")
        let node = instantiate(GameManager.instance.description);

        scene.addChild(node);
        node.setPosition(0,0);
        node.parent=parentnode
        director.pause();
    }

    private continueGame(event,args){
        director.resume();
    }
    //游戏结束，总分结算
    public static gameOver(){
        //先等动画完成后再pause，此处先禁用玩家下钩等操作
        UIController.ShowFinalScore(GameManager.instance.score);
    }
}

