import {
    Component,
    director,
    _decorator,
    instantiate,
    Prefab,
    find,
    Label,
    UIOpacity,
    NodeEventType,
} from "cc";
import { UIController } from "./UIController";
import { PlayerData } from "../PlayerData";
import { SceneController } from "../SceneController";
import { AudioController } from "../AudioController";
import { MinerController } from "./MinerController";

import Sentry from "@sentry/browser";

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

    @property(UIOpacity)
    private TipBoardOpacity:UIOpacity = null;

    private isGameOver:boolean;

    //每局游戏注册MinerController
    private miner:MinerController=null;

    private static instance: GameController = null;

    onLoad() {

        //发送开始游戏信息
        Sentry.captureMessage("EnterGame!");
        PlayerData.hasPlay=true;


        this.playerData = find("PlayerData").getComponent(PlayerData);
        
        //进入下一关,关卡开始时进行技能使用(更新序列化信息，不是单例)
        let ins = GameController.instance = this;
        
        /*
        if (ins == null) {
            //重开新游戏,获得游戏数据节点
            
        } else {
            
            ins.playerData= find("PlayerData").getComponent(PlayerData);
            
            ins = GameController.instance = this;
        }
        */

        //展示初始UI信息
        ins.setUserName();
        ins.leftTime = ins.playerData.totalTime;
        UIController.setTime(ins.leftTime);
        UIController.setScore(ins.playerData.money);

        //等待用户点击提示后开始游戏
        ins.isGameOver=true;
        ins.TipBoardOpacity.node.on(NodeEventType.TOUCH_START,ins.macroHookDown,ins);

        //第一次进入游戏会多一个提示，点击后才开始游戏
        if(ins.playerData.isFirstTimePlay){
            ins.TipBoardOpacity.opacity=255;
        }else{
            ins.TipBoardOpacity.opacity=0;
            //直接开始游戏
            console.log("Let game Begin!");
            ins.letGameBegin();
        }

    }

    //注册矿工组件，用于控制下钩
    public static registerMiner(miner:MinerController){
        GameController.instance.miner=miner;
    }

    private macroHookDown(){
        let ins=GameController.instance;
        if(ins.playerData.isFirstTimePlay){
            ins.playerData.isFirstTimePlay=false;
            ins.letGameBegin();
        }
        else{
            //调用MinerController的下钩
            ins.miner.hookDown(null,0);
        }
    }

    private letGameBegin(){
        let ins=GameController.instance;

        //去除灰雾
        ins.TipBoardOpacity.opacity=0;
        //开始响应下钩
        ins.isGameOver = false;
        //开始计时
        ins.schedule(ins.setTime, 1);
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
        let leftT=--GameController.instance.leftTime;
        
        if (leftT <= 0) {
            this.unschedule(this.setTime);
            GameController.gameOver();
            return;
        }
        //倒计时音效
        if(leftT == 3) AudioController.playTimeOut();

        UIController.setTime(leftT);
    }

    public static setProfit(profit: number) {
        GameController.getPlayerData().money+=profit;
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
        AudioController.playGameOver();

        //可直接控制注册的miner属性
        //GameController.instance.miner.node.active=false;
        GameController.instance.isGameOver = true;
        
        UIController.ShowFinalScore(GameController.getPlayerData().money);

        //刚刚结束了一场游戏
        PlayerData.hasJustFinish=true;

    }

    public static showEndingScene(){
        SceneController.loadSettlingScoreScene(GameController.getPlayerData().money);
    }


    private goToRank(event:Event){
        console.log("ToRankPage");
        SceneController.loadScene("RankPage");
    }
}
