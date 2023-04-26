import { CCClass, director, _decorator, Component, Button } from "cc";

const { ccclass, property } = _decorator;
var name: string = "Runoob";

@ccclass("SceneManager")
export class SceneManager extends Component {
    //分数结算场景，成功通关或失败
    showSettlingScoreScene() {
        director.loadScene("SettlingScoreScene", (_, scenes) => {});
    }

    update(deltaTime: number) {}
}
