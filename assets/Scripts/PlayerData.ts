import { _decorator, Component, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerData")
export class PlayerData extends Component {
    @property
    public UserName = "tomato";
    @property
    public money = 0;
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
    @property
    public score = 0;

    private static instance: PlayerData = null;

    start() {
        let scene = director.getScene();
        let node = scene.getChildByName("PlayerData");
        director.addPersistRootNode(node);
        console.log("成功持久化 PlayData");
    }

    update(deltaTime: number) {}
}
