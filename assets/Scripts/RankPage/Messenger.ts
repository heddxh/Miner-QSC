import { _decorator, Component, Node, find, sys } from 'cc';
import { PlayerData } from '../PlayerData';
import { RankController,User } from './RankController';
const { ccclass, property } = _decorator;



@ccclass('Messenger')
export class Messenger extends Component {
    
    @property
    private path:string="";
    
    private PD:PlayerData;

    @property
    private topNum:number=0;


    private historyHigh:number=0;
    //在开始页面还有一个ping，测验得分是否有效
    start() {

        //展示不用服务器就能获取的内容（本地存储）
        
        this.PD=find("PlayerData").getComponent(PlayerData);
        

        //获取可能已有的ID
        let userIds=sys.localStorage.getItem(PlayerData.userIdLocalKey);
        if(userIds==null) userIds="";
        this.PD.setUserId(userIds);

        
        //获取历史最高分
        let historyHighs=sys.localStorage.getItem(PlayerData.highScoreLocalKey);

        console.log(historyHighs);
        
        if(historyHighs==null) historyHighs="0";

        let historyHigh:number = parseInt(historyHighs);
        this.historyHigh=historyHigh;

        //展示分数
        RankController.showTwoScore(this.PD.money,historyHigh);


        //显示转圈,正在上传数据中
        RankController.showLoading();
        

        
    }


    reSubmit(){
        //重新提交
        RankController.showLoading();
        this.submit();
    }

    submit(){
        let historyHigh=this.historyHigh;
        let userIds = this.PD.getUserId();

        //准备数据，注意按userid判断是否刷新原有记录
        let userInfo={
            username:this.PD.playerName,
            score:this.PD.money,
            userid:userIds,
        };
        
            fetch(this.path+"/submit",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                credentials:"include",
                body:JSON.stringify(userInfo),
            }).then(res=>res.json()).then(
            (data)=>{
                console.log(data);
                data=data.data;
                //结束转圈
                RankController.successLoading();
    
                //调用get获取总排行榜
                this.getRank();
    
                //展示当前玩家排行
                RankController.showUserRank(data.user.rank,
                (data.total-data.user.rank+1)/data.total/100);
    
    
                //存储当前玩家ID(如果没有)
                if(userIds==""){
                    userIds=data.user.userid;
                    sys.localStorage.setItem(PlayerData.userIdLocalKey,userIds);
                }
                this.PD.setUserId(userIds);
    
    
                //这个时候才存储最高分
                if(this.PD.money>historyHigh){
                
                    historyHigh=this.PD.money;
                    sys.localStorage.setItem(PlayerData.highScoreLocalKey,historyHigh.toString());
                    
                }
    
            }
            ).catch((err)=>{this.failLoading(err);});
    }


    failLoading(err){
        RankController.failLoading();
        console.log(err);
    }


    //拷贝兑奖码
    copy(){
        RankController.copy(this.PD.getUserId());
    }


    getRank(){
        fetch(this.path+"/top_score",
            {
                method:"GET",
                headers:{"Content-Type":"application/json"},
                credentials:"include",
                body:JSON.stringify({n:this.topNum}),
            }
            ).then(res=>res.json()).then(
            (data)=> {

                //调用RankController的生成排行函数
                console.log(data.msg);
                RankController.showWholeRank(data);
                
            }).catch(err=>{this.failLoading(err)});
    }
}

