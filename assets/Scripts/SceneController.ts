import { CCClass, director, _decorator, Component, Button, find } from "cc";

const { ccclass, property } = _decorator;

@ccclass("SceneController")
export class SceneController extends Component {
    
    //分数结算场景，成功通关或失败
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
        director.loadScene(sceneName);
    }

    update(deltaTime: number) {}
}
