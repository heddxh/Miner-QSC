import { _decorator, Component, director, Node,instantiate ,Button, Label} from 'cc';
const { ccclass, property } = _decorator;

let zdty:number=0; //浙大体艺
let shxj:number=0; //三花学姐
let wmg:number=0;  //外卖柜
let qsc:number=0; //求是潮
let kyj:number=0; //烤鸭卷
let coin:number=500; //金钱
let username:string="tomato"; //用户名

@ccclass('ShopPage')
export class ShopPage extends Component {

    //商品
    @property({type:Node})
    private target1: Node = null;
    @property({type:Node})
    private target2: Node = null;
    @property({type:Node})
    private target3: Node = null;
    @property({type:Node})
    private target4: Node = null;
    @property({type:Node})
    private target5: Node = null;

    @property({type:Node})
    private money: Node = null;
    @property({type:Node})
    private user_name: Node = null;

    //商店内对话框
    @property({type:Node})
    private msg: Node = null;

    onLoad() {
        
    }

    start() {

        //监测手指是否触摸物品
        this.target1.on(Node.EventType.TOUCH_START, (event) => {
            console.log('1 Touch');
            this.msg.getComponent(Label).string="崩坏时炸毁抓到的东西\n 我保留了一点不稳定性,才知道你用的是浙大体艺"
          }, this)
        this.target2.on(Node.EventType.TOUCH_START, (event) => {
            console.log('2 Touch');
            this.msg.getComponent(Label).string="“在求是潮的buff之下 钻石double闪闪!” 在关卡中钻石将变得相当值钱。"
          }, this)
        this.target3.on(Node.EventType.TOUCH_START, (event) => {
            console.log('3 Touch');
            this.msg.getComponent(Label).string="买了它以后，在下一关中你的力气将会增加，即抓东西的速增加。"
          }, this)
        this.target4.on(Node.EventType.TOUCH_START, (event) => {
            console.log('4 Touch');
            this.msg.getComponent(Label).string="它将增强你在下一关中从色袋中取得好东西的机遇。"
          }, this)
        this.target5.on(Node.EventType.TOUCH_START, (event) => {
            console.log('5 Touch');
            this.msg.getComponent(Label).string="“你会打开哪个柜门？恭喜你，拥有交换价值的权利”石头将有三次机遇会变成相当有价值的物品。"
          }, this)  
        
        this.user_name.getComponent(Label).string=username
        director.preloadScene("GameScene")
        
    }

    update(deltaTime: number) {
        this.money.getComponent(Label).string=<string>coin //显示金钱
    }

    StartGame(event:Event){
        director.loadScene("GameScene")
    }

    BuyItem(event:Event, customEventData:string){

        console.log('res:',customEventData);
        switch(customEventData){
            case '1' :
                if(coin>=50){
                    zdty++;
                    console.log('zdty:',zdty);
                    coin=coin-50;
                    break; 
                 }else{
                     console.log('Not enough money')
                 }
            case '2' :
                if(coin>=50){
                    qsc++;
                    console.log('qsc:',qsc);
                    coin=coin-50;
                    break; 
                 }else{
                     console.log('Not enough money')
                 }
            case '3' :
                if(coin>=75){
                    kyj++;
                    console.log('kyj:',kyj);
                    coin=coin-75;
                    break; 
                 }else{
                     console.log('Not enough money')
                 }
            case '4' :
                if(coin>=50){
                    shxj++;
                    console.log('shxj:',shxj);
                    coin=coin-50;
                    break; 
                 }else{
                     console.log('Not enough money')
                 }
            case '5' :
                if(coin>=75){
                    wmg++;
                    console.log('wmg:',wmg);
                    coin=coin-75
                    break; 
                 }else{
                     console.log('Not enough money')
                 }               
        }
    }

}

