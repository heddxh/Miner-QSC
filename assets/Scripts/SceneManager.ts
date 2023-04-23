import { _decorator, Component,director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
    
    Start(event: Event){
        director.loadScene("GameScene");
    }
}

