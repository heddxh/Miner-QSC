import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PingServer')
export class PingServer extends Component {
    
    private path:string;
    start() {
        fetch(this.path+"/ping").then((res)=>res.json())
        .then((data)=>{
            console.log()
        }).catch((err)=>{
            //无法访问服务器，用户成绩无效警告
            
        });
    }
}

