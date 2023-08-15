import { _decorator, Component, Node, CCString } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CommodityData')
export class CommodityData extends Component {

    @property
    private _price:number = 75;

    @property
    public leftNum:number = 1;

    @property({multiline:true})
    public description:string = "";
    
    get price():number{
        return this._price;
    }
    set price(newPrice:number){
        this._price=newPrice;
    }
}

