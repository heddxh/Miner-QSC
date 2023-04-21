import { Component, Label, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    setScore(event:Event,args){
        this.getComponentInChildren(Label).string = args;
    }
}

