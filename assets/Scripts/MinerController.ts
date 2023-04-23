import { _decorator, Component, Node , Sprite, Vec3, view, Collider2D, Contact2DType, SpriteFrame, Label, Color, instantiate, Prefab} from 'cc';
import { GameManager } from './GameManager';
import { OreData } from './OreData';
import { UIController } from './UIController';

const { ccclass, property } = _decorator;

@ccclass('MinerController')
export class MineController extends Component {
    
    @property({serializable:true})
    private startAngle:number = -40;
    @property
    private endAngle:number = 40;
    @property
    private rotateSpeed:number = 200;
    @property
    private hookoutSpeed:number = 400;
    @property
    private ropeLength:number = 2400;
    @property
    private refreshDelay:number = 0.4;
    @property
    private affectOfStrengthenDose:number =2;
    

    @property({group: { name: "钩子相关" },type:Node})
    private hookNode:Node;

    private hookNodeOriPos:Vec3;

    @property({group: { name: "钩子相关" },type:SpriteFrame})
    private hookHangingImg:SpriteFrame;
    @property({group: { name: "钩子相关" },type:SpriteFrame})
    private hookClosingImg:SpriteFrame;
    

    @property(Prefab)
    private bombPrefab:Prefab;

    @property({group: { name: "按钮相关" },type:Sprite})
    private hookButton:Sprite;
    @property({group: { name: "按钮相关" },type:SpriteFrame})
    private HookDownImg:SpriteFrame;
    @property({group: { name: "按钮相关" },type:SpriteFrame})
    private UseTNTImg:SpriteFrame;
    @property({group: { name: "按钮相关" },type:Label})
    private TNTText:Label;

    //初始参数，将初始角度作为0位置,方向向下。
    private originalAngle:number;
    private originalPos:Vec3;

    private amplitude:number;
    
    @property
    private oriRopeLength:number = 80;

    //状态参数
    private isHookOut:boolean = false;
    private isBack:boolean = false;

    //抓到了价值多少的矿物，用于结算(同时用于判断是否携带矿物)
    private ore:number = 0;
    private oreNode:Node;
    private oreOffset:Vec3;
    
    private isSettlingore:boolean = false;
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

        this.hookNodeOriPos = this.hookNode.getPosition();

        let rope = this.node.getChildByName("rope");
        this.ropeSprite = rope.getComponent(Sprite);
        this.ropeSprite.fillRange=(this.oriRopeLength)/this.ropeLength;
        
        
        this.TNTText.enabled = false;

        //开局技能的开关
        if(GameManager.getStrengthen){
            this.hookoutSpeed*=this.affectOfStrengthenDose;
        }
    }


    update(deltaTime: number) {
        if(!this.isHookOut){
            this.node.angle = this.node.angle+this.getAngularSpeed()*deltaTime;

        }else{
            this.tempVec = new Vec3(0,0,0);
            //控制出钩速度
            Vec3.multiplyScalar(this.tempVec,this.stretchVec,deltaTime);
            this.node.setPosition(
                this.node.getPosition()
                .add(this.tempVec)
            );
            
            //如果返回且携带矿物
            if(this.isBack && this.oreNode!=null){
                this.oreNode.setPosition(
                    this.node.getPosition().add(this.oreOffset));
            }

            //如果返回初始位置（getDistance必须执行）
            if(!this.isSettlingore && this.getHookDistance()<=20 && this.isBack){
                
                this.isSettlingore = true;
                this.TNTText.enabled = false;

                //钩子不动
                this.stretchVec.multiplyScalar(0);
                
                this.hookNode.setPosition(this.hookNodeOriPos);
                this.ropeSprite.fillRange=(this.oriRopeLength)/this.ropeLength;
                this.node.setPosition(this.originalPos);

                //结算
                this.settleore();
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

        this.ropeSprite.fillRange=(len+this.oriRopeLength)/this.ropeLength;
        
        return len;
    }

    //由按钮调用出钩函数
    hookDown(event:Event,args){

        if(!this.isHookOut){

            this.hookButton.spriteFrame = this.UseTNTImg;
            this.isHookOut = true;
            this.isBack = false;
            let toward=(this.node.angle - this.originalAngle-90)*Math.PI/180;
            
            this.stretchVec = new Vec3(Math.cos(toward),Math.sin(toward),0);
            
            this.stretchVec.multiplyScalar(this.hookoutSpeed);

            //处理炸药
            this.TNTText.enabled = true;
            let tnt = GameManager.getTNTNum();

            if(tnt <= 0) this.TNTText.color = Color.RED;
            else this.TNTText.color = Color.WHITE;

            this.TNTText.string = "剩余炸药:"+tnt.toString();

        }else if(!this.isSettlingore){
            //鞭炮技能，向GameManager要数据
            let tnt=GameManager.getTNTNum();
            if(tnt>0){
                //炸毁物体
                if(this.oreNode == null) return;
                this.destroyOre();

                //生成动画
                let tempBomb:Node = instantiate(this.bombPrefab);
                tempBomb.parent = this.node.parent;
                tempBomb.setPosition(this.node.getPosition());
                this.scheduleOnce(()=>{
                    tempBomb.destroy();
                },0.5);


                GameManager.setTNTNum(tnt-1);
                this.TNTText.string = "剩余炸药:"+GameManager.getTNTNum().toString();

                //快速返回
                if(!this.isBack) this.stretchVec.multiplyScalar(-1);
                this.stretchVec.normalize().multiplyScalar(this.hookoutSpeed);
                this.isBack = true;

            }else{
                //炸药不足提示
                this.hookButton.color = Color.RED;
                let count=0;
                this.schedule(function(){
                    count++;
                    this.hookButton.color = count%2==0? Color.RED : Color.WHITE;
                },0.1,6);
                
            }
        }
    }


    //满足边界碰撞、矿物碰撞时收钩
    hookBack(self: Collider2D, other: Collider2D,contact){
        
        if(this.isBack) return;

        if(other.tag == 2){
            //碰墙,直接返回
            
        }else if(other.tag == 1){
            //碰矿物，粘连带走
            this.oreNode=other.node;
            let oreData=this.oreNode.getComponent(OreData);
            
            this.stretchVec.multiplyScalar(oreData.dragForce);

            //矿物被抓到的反应
            oreData.getCaught();
            this.hookNode.getComponent(Sprite).spriteFrame = this.hookClosingImg;
            
            this.ore=oreData.value;

            this.oreOffset=new Vec3(0,0,0);
            Vec3.subtract(this.oreOffset,this.oreNode.getPosition(),this.node.getPosition());
        }
        this.stretchVec.multiplyScalar(-1);
        this.isBack = true;
    }

    destroyOre(){
        if(this.oreNode!=null){
            this.oreNode.destroy();
            this.oreNode=null;
        }
        this.ore=0;
    }

    //获得矿物，分数增长
    settleore(){
        //先加上钱再说，防止在显摆成果时去世
        if(this.oreNode!=null){
            UIController.setScoreAni(this.ore);
            //销毁矿物
            this.destroyOre();
        }

        this.hookNode.getComponent(Sprite).spriteFrame = this.hookHangingImg;
        //展示矿物和金钱
        
        this.scheduleOnce(function(){
            this.isHookOut = false;
            this.isSettlingore = false;
            this.isBack = false;
            this.hookButton.spriteFrame = this.HookDownImg;
            
        },this.oreNode?this.refreshDelay:0);

        
    }

}