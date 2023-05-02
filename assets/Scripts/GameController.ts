import {
    Component,
    director,
    _decorator,
    instantiate,
    Prefab,
    find,
    Label,
} from "cc";
import { UIController } from "./UIController";
import { PlayerData } from "./PlayerData";
import { SceneController } from "./SceneController";
const { ccclass, property } = _decorator;

@ccclass("GameController")
export class GameController extends Component {

    @property({ type: Prefab })
    private description: Prefab = null;


    //当前游戏剩余时间
    private leftTime: number;

    //获取常驻节点和节点上的脚本
    //关卡、技能数据直接保存在PlayerData中;
    private playerData:PlayerData = null;


    
    private isGameOver:boolean;

    private static instance: GameController = null;

    onLoad() {
        let ins = GameController.instance;

        if (ins == null) {
            //重开新游戏,获得游戏数据节点
            this.playerData = find("PlayerData").getComponent(PlayerData);
            ins = GameController.instance = this;
            this.dataInitialize();
        } else {
            //进入下一关，关卡开始时进行技能使用
            ins.playerData.level += 1;
            this.destroy();
        }
        
        ins.setUserName();
        ins.isGameOver = false;
        
        //等待任务发布的时间后开始游戏
        ins.leftTime = ins.playerData.totalTime;
        UIController.setTime(ins.leftTime);

        ins.schedule(ins.setTime, 1);

    }

    private dataInitialize(){
        let data = GameController.getPlayerData();
        data.TNTNum=0;
        data.isDiamondPolish = data.isLucky = data.isRockAppreciate = data.isStrengthen = false;
        data.level=1;
        data.totalTime = 30;
    }

    public static getPlayerData(){
        return GameController.instance.playerData;
    }

    private setUserName() {
        let scene = director.getScene();
        let node = scene
            .getChildByName("Canvas")
            .getChildByName("UIDashBoard")
            .getChildByName("IdBoard")
            .getChildByName("Id");
        node.getComponent(Label).string = GameController.getPlayerData().playerName;
    }

    public static getTotalTime(): number {
        return GameController.getPlayerData().totalTime;
    }

    //继承上一关的分数
    public static getScore(): number {
        return GameController.getPlayerData().money;
    }

    private setTime() {
        GameController.instance.leftTime--;
        if (GameController.instance.leftTime <= 0) {
            this.unschedule(this.setTime);
            GameController.gameOver();
            return;
        }
        UIController.setTime(GameController.instance.leftTime);
    }

    public static setProfit(profit: number) {
        GameController.getPlayerData().money+=profit;
        UIController.setScore(GameController.getPlayerData().money);
    }

    public static getTNTNum(): number {
        return GameController.getPlayerData().TNTNum;
    }

    public static setTNTNum(num: number) {
        GameController.getPlayerData().TNTNum = num;
    }

    public static setDiamondPolish() {
        GameController.getPlayerData().isDiamondPolish = true;
    }

    public static getDiamondPolish(): boolean {
        return GameController.getPlayerData().isDiamondPolish;
    }

    public static setLucky() {
        GameController.getPlayerData().isLucky = true;
    }

    public static getLucky(): boolean {
        return GameController.getPlayerData().isLucky;
    }

    public static setRockAppreciate() {
        GameController.getPlayerData().isRockAppreciate = true;
    }

    public static getRockAppreciate(): boolean {
        return GameController.getPlayerData().isRockAppreciate;
    }

    public static setStrengthen() {
        GameController.getPlayerData().isStrengthen = true;
    }

    public static getStrengthen(): boolean {
        return GameController.getPlayerData().isStrengthen;
    }

    public static getIsGameOver():boolean {
        return GameController.instance.isGameOver;
    }

    //查看水产介绍，停止计时

    private seeIntroduction(event, args) {
        if(GameController.instance.isGameOver){
            return;
        }
        let scene = director.getScene();
        let parentnode = scene.getChildByName("Canvas");
        let node = instantiate(GameController.instance.description);

        scene.addChild(node);
        node.setPosition(0, 0);
        node.parent = parentnode;
        director.pause();
    }

    private continueGame(event, args) {
        director.resume();
    }

    //游戏结束，总分结算
    public static gameOver() {
        //先等动画完成后再pause，此处先禁用玩家下钩等操作
        GameController.instance.isGameOver = true;
        UIController.ShowFinalScore(GameController.getPlayerData().money);
    }

    public static showEndingScene(){
        SceneController.loadSettlingScoreScene(GameController.getPlayerData().money);
    }
}
