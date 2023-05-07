import { _decorator, Component, Node, Prefab, Label } from 'cc';
const { ccclass, property } = _decorator;

export type User={
    rank:number; 
    username:string; 
    score:number;

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
    private userScoreLabel:Label;
    
    //玩家超越百分比文本
    @property(Label)
    private transcendPercentLabel:Label;
    
    //按玩家得分段位进行评语
    @property(Label)
    private judgement:Label;

    start() {

    }

    //显示整个排行榜
    public static createRank(users:User[]){
        for(let q in users){
            users[q].rank;
            users[q].username;
            users[q].score;
        }
    }

    //显示当前用户的排行
    public static createUserRank(currentRank:number){

    }

    //正在等待服务器响应，显示转圈
    public static showLoading(){

    }

    //服务器响应成功，取消转圈
    public static successLoading(){

    }

    //服务器响应失败，也取消转圈，但显示失败信息
    public static failLoading(){

    }

    //点击重新游戏
    replay(event,arg){

    }
    
}

