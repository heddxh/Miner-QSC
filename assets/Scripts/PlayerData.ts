import { _decorator, Component, director, CCInteger } from "cc";
import { CommoType } from "./ShopPage/ShopLogic";
import { LevelConst } from "./TrialHall/LevelConst";
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
    
    public totalTime: number = 100;
    //所在关卡信息(只有无尽模式要用)
    public level:number = 1;
    public targetMoney:number = 150;
    public isEndlessMode:boolean = false;

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

    public commodityPriceList:[number,number,number,number,number]=[75,75,75,50,75];

    //判断是否已经实例化过，根据UserId,可以刷新记录
    public static hasInit:boolean=false;

    //判断是否游戏过，根据是否游戏确定是否显示当局排名
    public static hasPlay:boolean=false;

    //判断是否从大厅进来，还是刚刚结束一次游戏，决定是否上交
    public static hasJustFinish:boolean=false;

    start() {
        if(!PlayerData.hasInit){
            //第一次游玩
            director.addPersistRootNode(this.node);
            console.log("成功持久化 PlayData");
            PlayerData.hasInit=true;
            PlayerData.hasJustFinish=false;
        }else{
            //例如Unity，持久化节点在二次进入场景时又会生成一个重复的持久节点，要删去
            this.destroy();
        }
    }

    //玩家数据彻底刷新，在新的一局才使用
    public dataInitialize(){
        let data = this;
        //道具清空
        data.TNTNum=0;
        data.isDiamondPolish = data.isLucky = data.isRockAppreciate = data.isStrengthen = false;
        data.isFirstTimePlay=true;
        //关卡清0
        data.level=1;
        data.totalTime=100;
        data.targetMoney=150;
        for(let i=0;i<LevelConst.OriginalPrice.length;i++){
            data.commodityPriceList[i]=LevelConst.OriginalPrice[i];
        }
        //开局150块钱
        data.money=150;
    }

    //玩家数据关卡间刷新
    public dataToNextLevel(){
        let data = this;
        data.level++;
        
        //在技能失效之前完成涨价操作
        for(let i=0;i<LevelConst.OriginalPrice.length;i++){
            let hasBought=false;
            if((i===CommoType.DIAMOND && data.isDiamondPolish)||
            (i===CommoType.ROCK && data.isRockAppreciate) ||
            (i===CommoType.LUCKY && data.isLucky) ||
            (i===CommoType.STRENGTH && data.isStrengthen)) hasBought=true;
            data.commodityPriceList[i]=LevelConst.getPriceAdjust(data.level,i,hasBought);
        }
        data.isDiamondPolish = data.isLucky = data.isRockAppreciate = data.isStrengthen = false;
        
    }


    //创建本地的UserId
    public setUserId(id:string){
        this.userId=id;
    }

    public getUserId(){
        return this.userId;
    }
}
