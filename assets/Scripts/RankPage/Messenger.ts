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
        //显示转圈,正在上传数据中
        RankController.showLoading();

        this.PD=find("PlayerData").getComponent(PlayerData);
        
        let userInfo={
            username:this.PD.playerName,
            score:this.PD.money
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

            //获取当前玩家排行
            RankController.createUserRank(data.user.rank);
            
            //存储当前玩家ID
            sys.localStorage.setItem("QSCMinerUserId",data.user.UserID);

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
                RankController.createRank(data);
                
            }).catch(err=>{this.failLoading(err)});
    }
}

