import { _decorator, Component, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerData")
export class PlayerData extends Component {

    //记录玩家是否是第一次游玩(以是否到过提示下矿来判断)
    @property
    public isFirstTimePlay = true;

    //玩家名字
    @property
    public playerName = "tomato";
    @property
    public money = 0;
    
    //所在关卡信息
    @property
    public totalTime: number = 120;
    public level:number = 1;

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

    //判断是否已经游玩过，根据UserId,可以刷新记录
    private static hasCreate:boolean=false;
    start() {
        if(!PlayerData.hasCreate){
            
            director.addPersistRootNode(this.node);
            console.log("成功持久化 PlayData");
            PlayerData.hasCreate=false;

        }else{

            this.destroy();
            
        }
    }
}
