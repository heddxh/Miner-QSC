import { _decorator, Component, Node, find, sys } from 'cc';
import { PlayerData } from '../PlayerData';
import { PingServer } from '../StartPage/PingServer';
import { RankController,User } from './RankController';
const { ccclass, property } = _decorator;

import Sentry from "@sentry/browser";


@ccclass('Messenger')
export class Messenger extends Component {
    
    private path:string="";
    
    private PD:PlayerData;

    //拿到前几名的数据
    private topNum:number=100;

    //历史最高数据
    private historyHigh:number=0;

    private historyRank:number=0;
    //在开始页面还有一个ping，测验得分是否有效
    start() {

        //展示不用服务器就能获取的内容（本地存储）
        this.path = PingServer.path;

        this.PD=find("PlayerData").getComponent(PlayerData);
        

        //获取肯定已有的ID，在StartPage中已经生成
        //let userIds=this.PD.getUserId();
        
        //获取历史最高分
        let historyHighs=sys.localStorage.getItem(PlayerData.highScoreLocalKey);

        console.log(historyHighs);
        
        if(historyHighs==null) historyHighs="0";

        let historyHigh:number = parseInt(historyHighs);
        this.historyHigh=historyHigh;


        //只有游玩了才上传当前玩家分数
        if(PlayerData.hasPlay && PlayerData.hasJustFinish){
            //展示分数
            RankController.showTwoScore(this.PD.money,historyHigh);

            //显示转圈,正在上传数据中
            RankController.showLoading();
            
            //上传数据
            this.submit();
        }else{
            //否则只是获取总排行榜和玩家个人历史最高
            
            //在此基础上，如果是从大厅来的，还要使用上一次的游玩数据
            if(PlayerData.hasPlay){
                RankController.showTwoScore(this.PD.money,historyHigh);
            }

            this.getRank();
            this.getHistoryRank();
        }
        
    }

    //获取历史最高排名
    getHistoryRank(){
        fetch(this.path+"/user_score?userid="+this.PD.getUserId(),
            {
                method:"GET",
                credentials:"include",
            }
            ).then(res=>res.json()).then(
            (data)=> {
                data=data.data;

                //调用RankController的设置玩家排行函数
                console.log("success get user rank!");
                RankController.showHisScore(this.historyHigh);
                this.historyRank=data.user.rank;

            }).catch(err=>{this.failLoading(err)});
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
                data=data.data;
                //结束转圈
                RankController.successLoading();
    
                //调用get获取总排行榜
                this.getRank();
    
                //展示当前玩家排行
                RankController.showUserRank(data.user.rank,
                ((data.total-data.user.rank+1)/data.total*100).toFixed(1));

                this.historyRank=data.user.rank;
    
                //存储当前玩家ID(如果没有)
                if(userIds==""){
                    userIds=data.user.userid;
                    sys.localStorage.setItem(PlayerData.userIdLocalKey,userIds);
                }
                this.PD.setUserId(userIds);
    
    
                //刷记录时存储最高分
                if(this.PD.money>historyHigh){
                
                    historyHigh=this.PD.money;
                    sys.localStorage.setItem(PlayerData.highScoreLocalKey,historyHigh.toString());
                    
                }

                //sentry发送数据
                Sentry.captureMessage("FinishGame!");
    
            }
            ).catch((err)=>{this.failLoading(err);});
    }



    showReward(){
        RankController.showReward(this.PD.getUserId(),this.historyRank);
    }

    hideReward(){
        RankController.closeReward();
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
        fetch(this.path+"/top_scores?n="+this.topNum.toString(),
            {
                method:"GET",
                credentials:"include",
            }
            ).then(res=>res.json()).then(
            (data)=> {

                //调用RankController的生成排行函数
                console.log("success get whole rank!");
                RankController.showWholeRank(data.data);
                
            }).catch(err=>{this.failLoading(err)});
    }
}

