import {
    _decorator,
    Component,
    Node,
    director,
    Button,
    EditBox,
    find,
    sys,
} from "cc";
import { AudioController } from "../AudioController";
import { PlayerData } from "../PlayerData";
import { SceneController } from "../SceneController";
const { ccclass, property } = _decorator;

import Sentry from "@sentry/browser";
import { UIController } from "../GamePage/UIController";

let username: string;

@ccclass("StartPage")
export class StartPage extends Component {

    @property({ type: PlayerData })
    private PD: PlayerData = null;

    @property({type:Node})
    private inputBlock:Node = null;

    @property({type:[Node]})
    private description:Node[]=[];


    UsernameNode = null;

    onLoad() {
        //尝试获取id
        let userIds=sys.localStorage.getItem(PlayerData.userIdLocalKey);

        //如果没有，随机生成一个
        if(userIds==null){
            userIds=this.randUserId();
            console.log(userIds);
            sys.localStorage.setItem(PlayerData.userIdLocalKey,userIds);
        }

        let scene = director.getScene().name;
        
        //判断是否要输入玩家姓名
        if (scene == "StartPage" && PlayerData.hasInit==false) {
            this.ShowInputbox();
        }else{
            this.inputBlock.active=false;
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
        
        //设置用户名
        username = this.UsernameNode.getComponent(EditBox).string;
        
        //检查是否有输入用户名，没有则提示用户输入
        if (username == ""){
            UIController.showToast("请输入用户名!",1000);
            return;
        }

        this.PD.playerName = username;
        console.log("username:", username);

        //sentry设置用户id
        Sentry.setUser({id:this.PD.getUserId(),name:username});
        

        //除雾，启用开始游戏按钮
        AudioController.playButtonClick();

        this.inputBlock.active=false;

        this.node
            .getChildByName("StartPagePerson")
            .getChildByName("Start")
            .getComponent(Button).interactable = true;
        
        
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


    //随机生成用户ID
    randUserId():string{
        let res:string="";

        for(let q=0;q<10;q++){
            res = res.concat(String.fromCharCode(65 + Math.floor(Math.random()*52)));
        }
        return res;
    }
    
}
