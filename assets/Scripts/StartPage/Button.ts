import { _decorator, Component, Node ,director,Button,input, EditBox,log} from 'cc';
const { ccclass, property } = _decorator;

let username:string

@ccclass('StartPage')
export class StartPage extends Component {

    UsernameNode=null

    onLoad(){
        let scene=director.getScene().name;
        if (scene=="StartPage"){
            this.ShowInputbox();
        }
        this.UsernameNode=this.node.getChildByName("上传框").getChildByName("输入框")
    }

    start() {
        director.preloadScene("Shop")
    }

    update(deltaTime: number) {

    }

    GoShop(event: Event){
        director.loadScene("Shop");
        
    }

    ShowInputbox(){
        this.node.getChildByName("StartPagePerson").getChildByName("Start").getComponent(Button).interactable = false;
    }

    EnterGame(event:Event){
        this.node.getChildByName("上传框").destroy();
        this.node.getChildByName("半透灰").destroy();
        this.node.getChildByName("StartPagePerson").getChildByName("Start").getComponent(Button).interactable = true;
        username=this.UsernameNode.getComponent(EditBox).string
        console.log('username:',username)
    }

}

