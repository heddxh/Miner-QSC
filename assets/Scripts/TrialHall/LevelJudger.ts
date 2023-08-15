import { _decorator, Component, find, Label } from 'cc';
import { AudioController } from '../AudioController';
import { PlayerData } from '../PlayerData';
import { SceneController } from '../SceneController';
import { LevelConst } from './LevelConst';
const { ccclass, property } = _decorator;

@ccclass('LevelJudger')
export class LevelJudger extends Component {
    /**
     * only allow this scene as a transition between level.
     * 
     */
    @property(Label)
    public readonly titleLabel:Label;

    @property(Label)
    public readonly contentLabel:Label;

    start(){
        //进入音效
        AudioController.playEndlessBegin();
        const playerData=find("PlayerData").getComponent(PlayerData);
        const target:number=LevelConst.getLevelTarget(playerData.level,playerData.targetMoney);
        //根据数据显示提示信息
        this.titleLabel.string="第 "+playerData.level.toString()+" 关";
        this.contentLabel.string="目标分："+target.toString();
        //更新关卡信息
        playerData.targetMoney=target;
        playerData.totalTime=LevelConst.getLevelTime(playerData.level);
        //跳转到商店
        this.scheduleOnce(()=>{
            SceneController.loadScene("Shop");
        },2.8);
    }
}

