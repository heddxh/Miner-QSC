import { _decorator, Component, Node, find } from 'cc';
import { PlayerData } from '../PlayerData';
const { ccclass, property } = _decorator;

@ccclass('Messenger')
export class Messenger extends Component {
    
    private path:string="";
    
    private PD:PlayerData;
    //在开始页面还有一个ping，测验得分是否有效
    start() {
        //显示转圈,正在上传数据中
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

            //再调用get获取排行

            this.getRank();
        }
        );



    }


    getRank(){
        fetch(this.path,
            {
                method:"GET",
                headers:{"Content-Type":"application/json"},
                credentials:"include",
                
            }
            ).then(res=>res.json()).then(
            (data)=> {
    
            }).catch(err=>{console.log(err)})
            .catch(err=>{console.log(err)});
    }
    update(deltaTime: number) {
        
    }
}

