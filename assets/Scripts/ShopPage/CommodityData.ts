import { _decorator, Component, Node, CCString } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CommodityData')
export class CommodityData extends Component {

    @property
    public price:number = 75;

    @property
    public leftNum:number = 1;

    @property({multiline:true})
    public description:string = "";
    
}

