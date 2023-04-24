import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Description')
export class Description extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    ClosePage(event:Event){
        director.resume;
        this.node.destroy();
    }
}

