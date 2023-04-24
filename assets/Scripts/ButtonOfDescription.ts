import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Description')
export class Description extends Component {

    ClosePage(event:Event){
        director.resume();
        let scene=director.getScene();        
        this.node.parent=scene;
    }
}

