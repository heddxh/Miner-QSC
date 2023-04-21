import { _decorator, Component, Node , Sprite, Vec3, view, Collider2D, Contact2DType, Button} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MinerController')
export class Hook extends Component {
    
    @property({serializable:true})
    private startAngle:number = -40;
    @property
    private endAngle:number = 40;
    @property
    private rotateSpeed:number = 200;
    @property
    private hookoutSpeed:number = 400;
    @property
    private ropeLength:number = 1000;

    //初始参数，将初始角度作为0位置,方向向下。
    private originalAngle:number;
    private originalPos:Vec3;

    private amplitude:number;

    //状态参数
    private isHookOut:boolean = false;
    private isBack:boolean = false;
    //抓到了价值多少的矿物，用于结算
    private orl:number = 0;
    private isSettlingOrl:boolean = false;
    //true表示逆时针转动，false顺时针
    private rotateDirection:boolean = false;
    private stretchVec:Vec3 = new Vec3(0,0,0);
    private tempVec:Vec3;
    
    private colli:Collider2D;
    private ropeSprite;


    start() {
        this.colli = this.getComponentInChildren(Collider2D);
        this.colli.on(Contact2DType.BEGIN_CONTACT,this.hookBack,this);

        this.amplitude=this.endAngle-this.startAngle;
        
        this.originalAngle=this.node.angle;
        this.originalPos = this.node.getPosition();

        let rope = this.node.getChildByName("rope");
        this.ropeSprite = rope.getComponent(Sprite);
        
    }


    update(deltaTime: number) {
        if(!this.isHookOut){
            this.node.angle = this.node.angle+this.getAngularSpeed()*deltaTime;

        }else{
            this.tempVec = new Vec3(0,0,0);
            //控制出钩时绳子长度
            Vec3.multiplyScalar(this.tempVec,this.stretchVec,deltaTime);
            this.node.setPosition(
                this.node.getPosition()
                .add(this.tempVec)
            );

            //如果返回初始位置（getDistance必须执行）
            if(!this.isSettlingOrl && this.getHookDistance()<=5 && this.isBack){
                
                this.isSettlingOrl = true;
                //钩子不动
                this.stretchVec.multiplyScalar(0);
                this.settleOrl();
            }
        }
    }

    getAngularSpeed():number{
        if(this.node.angle > this.endAngle){
            this.rotateDirection = false;
        }else if(this.node.angle < this.startAngle){
            this.rotateDirection = true;
        }

        let x=(this.node.angle - (this.startAngle+this.endAngle)/2);

        return (this.rotateDirection?1:-1) 
        *(Math.cos(x/this.amplitude*Math.PI) + 0.5)*this.rotateSpeed;
    }


    //返回钩子下降高度，更新绳子长度，还可以根据距离更新钩子速度
    getHookDistance():number{
        let offset:Vec3=new Vec3(0,0,0);
        Vec3.subtract(offset,this.originalPos,this.node.getPosition());
        let len:number=offset.length();

        this.ropeSprite.fillRange=len/this.ropeLength;
        
        return len;
    }

    //由按钮调用出钩函数
    hookDown(event:Event,args){
        console.log("!!!");

        if(!this.isHookOut){
            this.isHookOut = true;
            this.isBack = false;
            let toward=(this.node.angle - this.originalAngle-90)*Math.PI/180;
            
            this.stretchVec = new Vec3(Math.cos(toward),Math.sin(toward),0);
            
            this.stretchVec.multiplyScalar(this.hookoutSpeed);
        }else{
            //鞭炮技能

        }
    }


    //满足边界碰撞、矿物碰撞时收钩
    hookBack(self: Collider2D, other: Collider2D,contact){
        
        if(other.tag == 2){
            //碰墙,直接返回
            
        }else if(other.tag == 1){
            //碰矿物
        }
        this.stretchVec.multiplyScalar(-1);
        this.isBack = true;
    }

    //结算
    settleOrl(){
        this.isHookOut = false;
        this.isSettlingOrl = false;

        this.isBack = false;
    }

}