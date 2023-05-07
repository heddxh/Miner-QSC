import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

import Sentry from "@sentry/browser";
import { UIController } from '../GamePage/UIController';

//sentry埋点
Sentry.init({
    dsn: "https://e9feb0aa363d42189aa7d0527494a144@sentry.zjuqsc.com/9",
    
    release:"process.env.npm_package_version",

    integrations:[new Sentry.BrowserTracing()],
    
    tracesSampleRate: 1.0,
});




@ccclass('PingServer')
export class PingServer extends Component {
    
    private path:string;
    start() {
        
        fetch(this.path+"/ping").then((res)=>res.json())
        .then((data)=>{
            console.log()
        }).catch((err)=>{
            //无法访问服务器，用户成绩无效警告
            UIController.showToast("警告<br/>未连接到服务器,成绩将无法参与排名",5000);
        });
    }
}

