import {
    _decorator,
    Component,
    Node,
    director,
    Button,
    input,
    EditBox,
    log,
    Prefab,
    instantiate,
    find,
} from "cc";
import { AudioController } from "../AudioController";
import { PlayerData } from "../PlayerData";
import { SceneController } from "../SceneController";
const { ccclass, property } = _decorator;

let username: string;

@ccclass("StartPage")
export class StartPage extends Component {
    @property({ type: Node })
    private PD: Node = null;

    @property({ type: Prefab })
    private description: Prefab = null;

    @property({type:Node})
    private inputBlock:Node = null;

    UsernameNode = null;

    onLoad() {
        let scene = director.getScene().name;
        
        if (scene == "StartPage" && PlayerData.hasPlayed==false) {
            this.ShowInputbox();
        }

        this.UsernameNode = this.inputBlock
            .getChildByName("上传框")
            .getChildByName("输入框");
    }

    start() {
        SceneController.preloadScene("Shop");
    }

    update(deltaTime: number) {}

    GoShop(event: Event) {
        SceneController.loadScene("Shop");
    }

    ShowInputbox() {
        this.node
            .getChildByName("StartPagePerson")
            .getChildByName("Start")
            .getComponent(Button).interactable = false;
        this.inputBlock.active=true;
    }

    EnterGame(event: Event) {

        AudioController.playButtonClick();

        this.inputBlock.active=false;

        this.node
            .getChildByName("StartPagePerson")
            .getChildByName("Start")
            .getComponent(Button).interactable = true;
        
        username = this.UsernameNode.getComponent(EditBox).string;
        if (username == "") username = "tomato";
        this.PD.getComponent(PlayerData).playerName = username;
        console.log("username:", username);
    }

    Description(event: Event) {
        let scene = director.getScene();
        let parentnode = scene.getChildByName("Canvas");
        let node = instantiate(this.description);

        scene.addChild(node);
        node.setPosition(0, 0);
        node.parent = parentnode;
    }
}