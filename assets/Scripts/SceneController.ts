import { CCClass, director, _decorator, Component, Button, find } from "cc";
import { AudioController } from "./AudioController";

const { ccclass, property } = _decorator;

@ccclass("SceneController")
export class SceneController extends Component {
    
    //分数结算场景，成功通关或失败(成功或失败音效)
    public static loadSettlingScoreScene(score:number) {
        if(score>9999){
            director.loadScene("GameScene");
        }else{
            director.loadScene("EndScene");
        }
    }

    public static preloadScene(sceneName:string){
        director.preloadScene(sceneName);
    }
    public static loadScene(sceneName:string){
        //切换场景，先放按钮点击音效
        AudioController.playButtonClick();

        director.loadScene(sceneName);
    }

    update(deltaTime: number) {}
}
