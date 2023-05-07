import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PingServer')
export class PingServer extends Component {
    
    private path:string;
    start() {
        //sentry埋点
        //https://78ff0daa56fa44c9b7f7d1863184f55b@o4505142427189248.ingest.sentry.io/4505142448685056
        //<script src='https://js.sentry-cdn.com/78ff0daa56fa44c9b7f7d1863184f55b.min.js' crossorigin="anonymous"></script>
        fetch(this.path+"/ping").then((res)=>res.json())
        .then((data)=>{
            console.log()
        }).catch((err)=>{
            //无法访问服务器，用户成绩无效警告
            
        });
    }
}

