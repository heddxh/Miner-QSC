import { _decorator, Component, CCInteger, SpriteFrame, Sprite, Enum, Collider2D, find, Vec3, Prefab, instantiate,Node, Contact2DType, Animation, AnimationComponent } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

enum OreType{
    Gold,Diamond,Bomb,RandomBag,Rock,Waste
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


    @property({group:{name:"运动方案"},tooltip:"Modify the Start and End as well Add RigidBody2D if You want to move this node"})
    private isMoving:boolean = false;
    
    @property({group:{name:"运动方案"},tooltip:"向左移动的最大距离"})
    private moveLeftX:number =0;
    @property({group:{name:"运动方案"},tooltip:"向右移动的最大距离"})
    private moveRightX:number = 100;
    
    //初始位置
    private moveOriX:number;

    @property({group:{name:"运动方案"}})
    private movingSpeed:number = 40;
    
    private faceTo:number = -1;
    private lastPosition:Vec3;

    private randomMinValue:number = 100;
    private randomMaxValue:number = 600;
    
    private explodeRadium:number = 300;

    private _count: number = 0;
    private _timeWaitDirectionChange: number = 10;
    private _direction: number = 0;
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    
    @property(Prefab)
    private bombPrefab:Prefab;

    start(){
        // 检测大学生碰撞
        let collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.studentCollide, this);

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

        // 全图随机移动
        if(this.isMoving){
            let ani:Animation = this.getComponent(AnimationComponent);
            
            if(ani!=null) ani.play();
            
            this.moveOriX = this.node.getPosition().x;
            // this.schedule(this.movingLeftRight,0.1);
            this.schedule(this.movingAround,0.1);
        }
    }
    
    studentCollide(selfCollider: Collider2D, otherCollider: Collider2D, contact: null): boolean {
        if (otherCollider.tag == 2) {
            return true;
        } else {
            return false;
        }
    }

    public movingAround() {
        this.lastPosition = this.node.getPosition(); // 为什么这里必须调用返回值而不是传参（哭）
        console.log(this.lastPosition);
        if (this.studentCollide) {
            console.log("碰撞了");
            this._direction = - Math.PI + this._direction;
            if (this._direction > 2 * Math.PI) {
                this._direction -= 2 * Math.PI;
            } else if (this._direction < 0) {
                this._direction += 2 * Math.PI;
            }
        } else {
            if (this._count > this._timeWaitDirectionChange) {
                this._direction = randomDirection(this._direction);
                this._count = 0;
            } else {
                this._count ++;
            }
        }        
        this._deltaPos.x = Math.cos(this._direction) * this.movingSpeed;
        this._deltaPos.y = Math.sin(this._direction) * this.movingSpeed;
        Vec3.add(this.lastPosition, this.lastPosition, this._deltaPos);
        this.node.setPosition(this.lastPosition);        

        function randomDirection(curDirection: number): number {
            // 角度变换范围在 -PI/4~PI/4 随机
            let direction: number = curDirection + Math.random() * 0.5 * Math.PI - 0.25 * Math.PI;
            if (direction > 2 * Math.PI) {
                direction -= 2 * Math.PI;
            } else if (direction < 0) {
                direction += 2 * Math.PI;
            }
            return direction;
        }
    }

    public movingLeftRight(){
        this.lastPosition = this.node.getPosition();

        if(this.lastPosition.x>this.moveOriX+this.moveRightX){
            this.faceTo=-1;
            this.node.setScale(this.node.getScale().multiply3f(-1,1,1));
        }else if(this.lastPosition.x<this.moveOriX-this.moveLeftX){
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
            let ani:Animation = this.getComponent(AnimationComponent);
            if(ani) ani.pause();
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
                let tntPos = this.node.getWorldPosition();

                let killList = [];

                this.explodeInCircle(killList,allMines,tntPos);
                

                for(let q in killList) killList[q].destroy();

                break;
            
        }
    }

    //用递归实现连环炸(统一用世界坐标)
    private explodeInCircle(killList:Component["node"][],searchList:Component["node"][],worldcenter:Vec3){
        //爆炸动画
        console.log(worldcenter);

        let oneBomb:Node = instantiate(this.bombPrefab);

        //不能挂在当前parent上，会被看成矿物删掉，可以挂载在其他节点上，但需要进行坐标系变换
        //这里统一用世界坐标系
        //或者额外判断爆炸动画，不加入销毁列表中
        this.node.parent.addChild(oneBomb);
        oneBomb.setScale(oneBomb.getScale().multiplyScalar(4));
        oneBomb.setWorldPosition(worldcenter);

        this.scheduleOnce(()=>{
                oneBomb.destroy();
        },0.5);
        

        for(let q in searchList){
            let oreData = searchList[q].getComponent(OreData);
            if(!oreData) continue;

            let thisPos:Vec3 = oreData.node.getWorldPosition();

            //注意不要更改thisPos
            let distance:number = Vec3.clone(thisPos).subtract(worldcenter).length();
            
            //在爆炸范围内，且没放入killList,(并排除自己this，自己作为毛的形式被捞上去),同时还不是动画,就保存在销毁列表中
            if(searchList[q].uuid != this.node.uuid && distance < this.explodeRadium
                && !killList.find(
                    (nowelement)=>{return nowelement.uuid == searchList[q].uuid;}
                    ))
                {
                    killList.push(searchList[q]);
                    //连环炸
                    if(oreData.type == OreType.Bomb){
                        console.log(thisPos);
                        this.explodeInCircle(killList,searchList,thisPos);
                    }
                }
        }
    }

}