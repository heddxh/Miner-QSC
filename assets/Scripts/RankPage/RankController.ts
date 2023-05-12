import { _decorator, Component, Node, Prefab, Label,find, instantiate, tween, Vec3} from 'cc';
import { UIController } from '../GamePage/UIController';
import { PlayerData } from '../PlayerData';
import { SceneController } from '../SceneController';
const { ccclass, property } = _decorator;

export type User={
    ser:number;
    rank:number; 
    username:string; 
    score:number;
    time:string;
}

@ccclass('RankController')
export class RankController extends Component {

    //排行榜上的一条名位记录，奇数名次用Odd，偶数名次用Even
    @property(Prefab)
    private oneRecordOdd:Prefab;
    @property(Prefab)
    private oneRecordEven:Prefab;

    //用于添加一条条排名的父节点
    @property(Node)
    private RankParentNode:Node;

    //玩家得分文本
    @property(Label)
    private curScoreLabel:Label;
    @property(Label)
    private hisScoreLabel:Label;

    

    //玩家超越百分比和排名文本
    @property(Label)
    private transcendPercentLabel:Label;
    
    @property(Label)
    private transcendRankLabel:Label;


    //按玩家得分段位进行评语
    @property(Label)
    private judgement:Label;

    @property(Node)
    private rewardBoard:Node;

    @property(Label)
    private rewardBoardId:Label;

    @property(Label)
    private rewardRankLabel:Label;


    @property(Node)
    private LoadingNode:Node;

    @property(Node)
    private LoadingFailNode:Node;

    private static instance:RankController=null;

    onLoad() {
        //不是单例模式，只不过方便类外调用
        let ins=RankController.instance=this;
        
        ins.rewardBoard.active=false;
    }

    public static showTwoScore(now:number,history:number){
        let ins=RankController.instance;
        ins.curScoreLabel.string=now.toString();
        ins.hisScoreLabel.string=history.toString();
    }


    //显示整个排行榜
    public static showWholeRank(users:User[]){

        let ins=RankController.instance;

        console.log(users);

        for(let q=0;q<users.length;q++){
            let one:Node=null;
            if(q%2==1){
                one=instantiate(ins.oneRecordOdd);
            }else{
                one=instantiate(ins.oneRecordEven);
            }
            //设置一条记录
            
            console.log(users[q]);

            one.getChildByName("RankNumberLabel")
            .getComponent(Label).string = users[q].rank.toString();
            
            one.getChildByName("RankNameLabel")
            .getComponent(Label).string = users[q].username.toString();
            
            one.getChildByName("RankScoreLabel")
            .getComponent(Label).string = "$"+users[q].score.toString();
            
            if(q>=48){
                one.setScale(one.getScale().multiplyScalar(0.8));
            }else if(q>=6){
                one.setScale(one.getScale().multiplyScalar(0.9));
            }

            ins.RankParentNode.addChild(one);
        }
    }

    //显示玩家超越百分比和排名
    public static showUserRank(currentRank:number,per:string){
        RankController.instance.transcendPercentLabel.string=per+"%";
        RankController.instance.transcendRankLabel.string="第"+currentRank.toString()+"名";
    }

    //正在等待服务器响应，显示转圈
    public static showLoading(){
        let ins=RankController.instance;
        ins.LoadingFailNode.active=false;
        ins.LoadingNode.active=true;
    }

    //服务器响应成功，取消转圈
    public static successLoading(){
        let ins=RankController.instance;
        ins.LoadingFailNode.active=false;
        ins.LoadingNode.active=false;
    }

    //服务器响应失败，也取消转圈，但显示失败信息
    public static failLoading(){
        let ins=RankController.instance;
        ins.LoadingNode.active=false;
        ins.LoadingFailNode.active=true;
    }

    //点击显示兑奖码
    public static showReward(id:string,rank:number){
        let ins=RankController.instance;
        ins.rewardBoard.active=true;

        ins.rewardRankLabel.string="您的历史最高名次:"+rank.toString();
        ins.rewardBoardId.string=id;

        tween().target(ins.rewardBoard)
        .to(0.5,{position:new Vec3(0,-92.307,0)},{easing:"cubicOut"})
        .start();
    }

    public static closeReward(){
        tween().target(RankController.instance.rewardBoard)
        .to(0.5,{position:new Vec3(0,-2040.029,0)},{easing:"cubicOut"})
        .call(()=>{
            RankController.instance.rewardBoard.active=false;
        })
        .start();
    }


    //点击重新游戏
    replay(event,arg){
        SceneController.loadScene("StartPage");
    }

    //点击拷贝
    public static copy(content:string){
        try{
            var aux=document.createElement("input");
            aux.setAttribute("value",content);
            document.body.appendChild(aux);
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
            UIController.showToast("复制成功!",1000);
            RankController.closeReward();

        }catch(err){
            UIController.showToast("复制失败，请手动复制",1000);
        }
    }
}

