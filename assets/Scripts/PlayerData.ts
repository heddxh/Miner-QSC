import { _decorator, Component, director, CCInteger } from "cc";
const { ccclass, property } = _decorator;



@ccclass("PlayerData")
export class PlayerData extends Component {

    //记录玩家是否是第一次游玩(以是否到过提示下矿来判断)
    @property
    public isFirstTimePlay = true;

    //玩家名字
    @property
    public playerName = "tomato";

    //玩家的userId
    private userId:string = "";

    public money = 150;
    
    //所在关卡信息
    public totalTime: number = 100;
    
    public level:number = 1;

    //不同关卡的总时间
    public static LevelTotalTimes:number[]=[100,];

    //技能数据
    @property
    public TNTNum = 0;
    @property
    public isDiamondPolish = false;
    @property
    public isStrengthen = false;
    @property
    public isLucky = false;
    @property
    public isRockAppreciate = false;

    @property
    public static userIdLocalKey="QSCMinerUserId";
    @property
    public static highScoreLocalKey="QSCMinerHistoryHigh";

    //判断是否已经实例化过，根据UserId,可以刷新记录
    public static hasInit:boolean=false;

    start() {
        if(!PlayerData.hasInit){
            //第一次游玩
            director.addPersistRootNode(this.node);
            console.log("成功持久化 PlayData");
            PlayerData.hasInit=true;
        }else{
            //例如Unity，持久化节点在二次进入场景时又会生成一个重复的持久节点，要删去
            this.destroy();
        }
    }

    //玩家数据彻底刷新，在新的一局才使用
    public dataInitialize(){
        let data = this;
        data.TNTNum=0;
        data.isDiamondPolish = data.isLucky = data.isRockAppreciate = data.isStrengthen = false;
        data.level=1;
        data.totalTime = PlayerData.LevelTotalTimes[0];
        //开局150块钱
        data.money=150;
    }

    //玩家数据关卡间刷新
    public dataToNextLevel(){
        let data = this;
        data.isDiamondPolish = data.isLucky = data.isRockAppreciate = data.isStrengthen = false;
        data.level++;
    }


    //创建本地的UserId
    public setUserId(id:string){
        this.userId=id;
    }

    public getUserId(){
        return this.userId;
    }
}
