import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Button')
export class Button extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
    
    StartGame(event:Event){
        director.loadScene("GameScene")
    }
}

