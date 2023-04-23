import {CCClass, director ,  _decorator} from "cc";

const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager{

    //分数结算场景，成功通关或失败
    showSettlingScoreScene(){
        director.loadScene('SettlingScoreScene', (_, scenes) => {
            
        })
    }

    update(deltaTime: number) {
        
    }
    
    Start(event: Event){
        director.loadScene("GameScene");
    }
}

