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

    private hasFail:boolean=false;

    //在开始页面还有一个ping，测验得分是否有效
    start() {

        //展示不用服务器就能获取的内容（本地存储）
        
        this.PD=find("PlayerData").getComponent(PlayerData);
        
        let historyHighs=sys.localStorage.getItem(PlayerData.highScoreLocalKey);
        let userIds=sys.localStorage.getItem(PlayerData.userIdLocalKey);

        console.log(historyHighs);
        
        //存储历史最高分
        if(historyHighs==null) historyHighs="0";

        let historyHigh:number = parseInt(historyHighs);
        
        if(this.PD.money>historyHigh){
            
            historyHigh=this.PD.money;
            sys.localStorage.setItem(PlayerData.highScoreLocalKey,historyHigh.toString());
            
        }

        //展示分数
        RankController.showTwoScore(this.PD.money,historyHigh);



        //显示转圈,正在上传数据中
        RankController.showLoading();
        

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
            //结束转圈
            RankController.successLoading();

            //调用get获取总排行榜
            this.getRank();

            //展示当前玩家排行
            RankController.showUserRank(data.user.rank,
            (data.total-data.user.rank+1)/data.total/100);


            //存储当前玩家ID(如果没有)
            if(userIds==null){
                userIds=data.user.userid;
                sys.localStorage.setItem(PlayerData.userIdLocalKey,userIds);
            }
            this.PD.setUserId(userIds);

        }
        ).catch((err)=>{this.failLoading(err);});

    }


    failLoading(err){
        if(!this.hasFail){
            this.hasFail=true;
            RankController.failLoading();
        }
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

