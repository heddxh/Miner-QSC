import {
    _decorator,
    Component,
    director,
    Node,
    Label,
    Sprite,
    SpriteFrame,
    find,
    Button,
    AnimationComponent
} from "cc";

import { PlayerData } from "../PlayerData";
import { SceneController } from "../SceneController";
import { UIController } from "../GamePage/UIController";
import { CommodityData } from "./CommodityData";
import { AudioController } from "../AudioController";
const { ccclass, property } = _decorator;


@ccclass("ShopLogic")
export class ShopLogic extends Component {
    //获取常驻节点和节点上的脚本（即玩家数据）
    private PD:PlayerData

    //商品，用数组保存
    @property({type:[Node]})
    private commodities:Node[] = [];

    private commoDatas:CommodityData[] = [];

    //已售罄图标
    @property({ type: SpriteFrame })
    private sold_out: SpriteFrame = null;

    //商品的普通图标
    @property({ type: [SpriteFrame] })
    private icon: SpriteFrame[] = [];

    @property({ type: Label })
    private moneyLabel: Label = null;

    @property({ type: Label })
    private user_nameLabel: Label = null;

    //商店内对话框
    @property({ type: Label})
    private msgLabel: Label = null;

    @property({type:AnimationComponent})
    private shopKeeperAni: Animation = null; 

    @property({type:SpriteFrame,tooltip:"商品未选中的默认框"})
    private unselectedBlock:SpriteFrame=null;

    @property({type:SpriteFrame,tooltip:"商品已选中时展现的框"})
    private selectedBlock:SpriteFrame=null;
    
    private lastSelected:number = -1;

    onLoad() {
        this.PD = find("PlayerData").getComponent(PlayerData);
    }

    start() {
        // 预加载 GameScene
        //SceneController.preloadScene("GameScene");
        

        //监测手指是否触摸物品
        for(let q in this.commodities){
            this.commoDatas[q] = this.commodities[q].getComponent(CommodityData);

            this.commodities[q].on(Node.EventType.TOUCH_START,(event)=>{
                this.setMsg(parseInt(q));
            },this);

            //显示价格
            this.commodities[q].getComponentInChildren(Label).string=
                "$ "+this.commoDatas[q].price.toString();

        }
        this.renewMoney();
        this.user_nameLabel.string = this.PD.playerName;
        
    }

    StartGame(event: Event) {
        SceneController.loadScene("GameScene");
    }


    setMsg(index:number){
        this.msgLabel.string = this.commoDatas[index].description;
        //讲解商品的动画和音效

        if(this.lastSelected != index){
            //选中当前框
            this.commodities[index].getComponent(Sprite).spriteFrame=this.selectedBlock;
            //取消上次选中框
            if(this.lastSelected != -1)
                this.commodities[this.lastSelected].getComponent(Sprite).spriteFrame=this.unselectedBlock;
            this.lastSelected = index;

        }else{
            //只是取消选中
            this.commodities[index].getComponent(Sprite).spriteFrame=this.unselectedBlock;
            
            this.lastSelected=-1;
        }

        AudioController.playButtonClick();
        this.shopKeeperAni.play();
    }

    renewMoney(){
        this.moneyLabel.string = this.PD.money.toString(); //更新显示金钱
    }

    BuyItem(event: Event, customEventData: string) {
        console.log("res:", customEventData);
        
        let index:number = parseInt(customEventData)-1;
        
        this.setMsg(index);

        //买得起并且还有剩余
        if(this.commoDatas[index].leftNum>0){
            if(this.PD.money >= this.commoDatas[index].price){
                if(index!=0){
                    this.commodities[index].getChildByName("priceTag").getComponent(Label).string="取消"
                }
                switch(index){
                    case 0:
                        this.PD.TNTNum++;
                        this.PD.money-=this.commoDatas[index].price;
                        break;
                    case 1:
                            this.PD.isDiamondPolish=true;
                            this.PD.money-=this.commoDatas[index].price;
                            break;
                    case 2:
                            this.PD.isStrengthen=true;
                            this.PD.money-=this.commoDatas[index].price;
                            break;
                    case 3:
                            this.PD.isLucky=true;
                            this.PD.money-=this.commoDatas[index].price;
                            break;
                    case 4:
                            this.PD.isRockAppreciate=true;
                            this.PD.money-=this.commoDatas[index].price;
                            break;
                }

                //购买的音效和动画
                AudioController.playBuyItem();
                this.renewMoney();
                
                
                //已售罄
                if((--this.commoDatas[index].leftNum) <= 0){
                    this.commodities[index].getChildByName("icon")
                    .getComponent(Sprite).spriteFrame = this.sold_out;
                }

                if(this.commoDatas[0].leftNum==0){
                    this.commodities[0].getChildByName("绿框").getComponent(Button).interactable=false;
                }
            }else{
                //余额不足
                
                UIController.redWarning(this.moneyLabel.node.getParent().getComponent(Sprite));
            }
        }else{
            switch(index){
                case 0:
                    
                case 1:
                    if(this.PD.isDiamondPolish){
                        this.PD.isDiamondPolish=false;
                        this.PD.money+=this.commoDatas[index].price;
                    }
                    break;
                case 2:
                    if(this.PD.isStrengthen){
                        this.PD.isStrengthen=false;
                        this.PD.money+=this.commoDatas[index].price;
                    }
                    break;
                case 3:
                    if(this.PD.isLucky){
                        this.PD.isLucky=false;
                        this.PD.money+=this.commoDatas[index].price;
                    }
                    break;
                case 4:
                    if(this.PD.isRockAppreciate){
                        this.PD.isRockAppreciate=false;
                        this.PD.money+=this.commoDatas[index].price;
                    }
                    break;
            }

            AudioController.playBuyItem();
            this.renewMoney();

            this.commoDatas[index].leftNum++;
            this.commodities[index].getChildByName("priceTag")
                    .getComponent(Label).string="$ "+this.commoDatas[index].price.toString();
            this.commodities[index].getChildByName("icon")
                    .getComponent(Sprite).spriteFrame = this.icon[index];
        }

    }
}
