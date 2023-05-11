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
    Scene,
} from "cc";
import { AudioController } from "../AudioController";
import { PlayerData } from "../PlayerData";
import { SceneController } from "../SceneController";
const { ccclass, property } = _decorator;

let username: string;

@ccclass("StartPage")
export class StartPage extends Component {

    @property({ type: PlayerData })
    private PD: PlayerData = null;

    @property({type:[Node]})
    private description:Node[] = [];

    @property({type:Node})
    private inputBlock:Node = null;


    UsernameNode = null;

    onLoad() {
        let scene = director.getScene().name;
        
        if (scene == "StartPage" && PlayerData.hasInit==false) {
            this.ShowInputbox();
        }
        
        this.UsernameNode = this.inputBlock
            .getChildByName("上传框")
            .getChildByName("输入框");

        //开始预加载所有场景
        SceneController.preloadScene("Shop");
        SceneController.preloadScene("GameScene");
        SceneController.preloadScene("RankPage");

    }

    start() {
        //延迟寻找留下的真playerdata,并为之初始化
        this.PD = find("PlayerData").getComponent(PlayerData);
        this.PD.dataInitialize();
    }


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
        this.PD.playerName = username;
        console.log("username:", username);
    }

    Description(event: Event,customEventData: string) {
        let index:number = parseInt(customEventData)-1;
        switch(index){
            case 0: 
                this.description[0].active=true;
                break;
            case 1:
                this.description[0].active=false;
                this.description[1].active=true;
                break;
            case 2:
                this.description[2].active=true;
                this.description[1].active=false;
                break;
            case 3:
                this.description[2].active=false;
                break;
        }
    }
    
    gotoRank(){
        SceneController.loadScene("RankPage");
    }
    
}
