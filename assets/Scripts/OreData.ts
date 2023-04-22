import { _decorator, Component, Node, CCInteger, CCBoolean, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('OreData')
export class OreData extends Component {
    @property(CCInteger)
    public value:number=0;

    @property
    public dragForce:number=0;

    @property(CCBoolean)
    public isRamdonBag:boolean=false;

    @property(CCBoolean)
    public isDiamond:boolean=false;

    @property(CCBoolean)
    public isBomb:boolean=false;


    @property({group:{name:"矿物显示多样性"}})
    private isMultiImgs:boolean = false;
    
    @property({type:[SpriteFrame],group:{name:"矿物显示多样性"}})
    private imgs:SpriteFrame[]=[];

    @property({group:{name:"矿物显示多样性"}})
    private isRotate:boolean = false;

    @property({group:{name:"矿物显示多样性"}})
    private isZoom:boolean = false;
    
    start(){
        //为多图矿物随机分配图片
        if(this.isMultiImgs){
            let ran:number=Math.floor(Math.random()*this.imgs.length);
            this.getComponent(Sprite).spriteFrame = this.imgs[ran];
        }
        //随机旋转角度
        if(this.isRotate){
            let amplitude:number = 30;
            let ran:number=Math.random()*amplitude*2-amplitude;
            this.node.angle+=ran;
        }
        //随机缩放尺寸
        if(this.isZoom){
            let amplitude:number = 0.2;
            let ran:number=Math.random()*amplitude*2+(1-amplitude);

            let ori=this.node.getScale();
            ori.x*=ran;
            ori.y*=ran;
            this.node.setScale(ori);
        }
        
    }

}