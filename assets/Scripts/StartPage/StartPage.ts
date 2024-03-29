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


    private UsernameNode = null;
    private userIds:string=null;

    onLoad() {
        //尝试获取id
        this.userIds=sys.localStorage.getItem(PlayerData.userIdLocalKey);

        //如果没有，随机生成一个
        if(this.userIds==null){
            this.userIds=this.randUserId();
            sys.localStorage.setItem(PlayerData.userIdLocalKey,this.userIds);
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
        //延迟寻找留下的真playerdata,先不为之初始化，当玩家进入游戏再初始化(保留上次游玩数据)
        this.PD = find("PlayerData").getComponent(PlayerData);
        this.PD.setUserId(this.userIds);
        PlayerData.hasJustFinish=false;
    }


    GoShop(event: Event) {
        //正式开玩，可以初始化玩家数据了
        this.PD.dataInitialize();
        this.PD.isEndlessMode=false;
        SceneController.loadScene("Shop");
    }

    GoEndlessTrial(event:Event){
        //进入无尽模式
        this.PD.dataInitialize();
        this.PD.isEndlessMode=true;
        this.PD.level=1;
        SceneController.loadScene("TrialHall");
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
        }else if(username.length>10){
            UIController.showToast("请输入十个字符以下的名字!",900);
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
            res = res.concat(String.fromCharCode(65 + Math.floor(Math.random()*57)));
        }
        return res;
    }
    
}
