import { _decorator, Component, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerData")
export class PlayerData extends Component {
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
    public TNTNum = 3;
    @property
    public isDiamondPolish = false;
    @property
    public isStrengthen = false;
    @property
    public isLucky = false;
    @property
    public isRockAppreciate = false;

    start() {
        let scene = director.getScene();
        let node = scene.getChildByName("PlayerData");
        director.addPersistRootNode(node);
        console.log("成功持久化 PlayData");
    }
}
