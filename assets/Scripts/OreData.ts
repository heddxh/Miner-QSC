import { _decorator, Component, CCInteger, SpriteFrame, Sprite, Enum, Collider2D, find, Vec3, Prefab, instantiate,Node, Contact2DType} from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

enum OreType{
    Gold,Diamond,Bomb,RandomBag,Rock
}

@ccclass('OreData')
export class OreData extends Component {
    
    @property(CCInteger)
    public value:number=0;

    @property
    public dragForce:number=0;

    @property({type:Enum(OreType)})
    public type:OreType = OreType.Gold;


    @property({group:{name:"显示方案"},tooltip:"Add imgs into List if You want to change img of this node"})
    private isMultiImgs:boolean = false;
    
    @property({type:[SpriteFrame],group:{name:"显示方案"}})
    private imgs:SpriteFrame[]=[];

    @property({group:{name:"显示方案"}})
    private isRotate:boolean = false;

    @property({group:{name:"显示方案"}})
    private isZoom:boolean = false;


    @property({group:{name:"运动方案"},tooltip:"Modify the Start and End if You want to move this node"})
    private isMoving:boolean = false;
    
    @property({group:{name:"运动方案"}})
    private startX:number =0;
    @property({group:{name:"运动方案"}})
    private endX:number = 100;

    @property({group:{name:"运动方案"}})
    private movingSpeed:number = 40;
    
    private faceTo:number = -1;
    private lastPosition:Vec3;

    private randomMinValue:number = 100;
    private randomMaxValue:number = 600;
    
    private explodeRadium:number = 300;
    
    @property(Prefab)
    private bombPrefab:Prefab;

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

        //左右来回移动
        if(this.isMoving){
            this.schedule(this.movingAround,0.2);
        }
    }
    
    public movingAround(){
        this.lastPosition = this.node.getPosition();

        if(this.lastPosition.x>this.endX){
            this.faceTo=-1;
            this.node.setScale(this.node.getScale().multiply3f(-1,1,1));
        }else if(this.lastPosition.x<this.startX){
            this.faceTo=1;
            this.node.setScale(this.node.getScale().multiply3f(-1,1,1));
        }

        this.lastPosition.x+=this.movingSpeed*this.faceTo;
        this.node.setPosition(this.lastPosition);
    }

    //由钩子调用,表示被抓到时,所有矿物们的反应
    public getCaught(){
        //停止乱动
        if(this.isMoving){
            this.unschedule(this.movingAround);
        }

        switch(this.type){
            
            case OreType.Diamond:
                //钻石涨价技能
                if(GameManager.getDiamondPolish()) this.value*=1.5;
                break;
            case OreType.Gold:

                break;
            case OreType.RandomBag:
                //随机价格
                this.value = this.randomMinValue + Math.round(
                    Math.random()*(this.randomMaxValue-this.randomMinValue)/10
                    )*10;
                break;
            case OreType.Bomb:
                //直接爆炸
                let MineMap = find("Canvas/MineMap");
                let allMines = MineMap.children;
                let tntPos = this.node.getPosition();
                let killList = [];

                this.explodeInCircle(killList,allMines,tntPos);
                
                console.log(killList);

                for(let q in killList) killList[q].destroy();

                break;
            
        }
    }

    //用递归实现连环炸
    private explodeInCircle(killList:Component["node"][],searchList:Component["node"][],center:Vec3){
        //爆炸动画
        let oneBomb:Node = instantiate(this.bombPrefab);
        //不能挂在当前parent上，会被看成矿物删掉
        this.node.parent.parent.addChild(oneBomb);
        oneBomb.setScale(oneBomb.getScale().multiplyScalar(5));
        oneBomb.setPosition(center);
        
        this.scheduleOnce(()=>{
                oneBomb.destroy();
        },0.5);
        

        for(let q in searchList){
            let thisPos:Vec3 = searchList[q].getPosition();

            let distance:number = thisPos.subtract(center).length();
            
            //在爆炸范围内，且没放入killList,(并排除自己this，自己作为毛的形式被捞上去),就直接废掉
            if(searchList[q].uuid != this.node.uuid && distance < this.explodeRadium
                && !killList.find(
                    (nowelement)=>{return nowelement.uuid == searchList[q].uuid;}
                    ))
                {
                killList.push(searchList[q]);

                let oreData = searchList[q].getComponent(OreData);

                //连环炸
                if(oreData && oreData.type == OreType.Bomb){
                    this.explodeInCircle(killList,searchList,thisPos);
                }
                
            }
        }
    }

}