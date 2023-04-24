import { _decorator, Component, Node ,director, CCInteger,CCBoolean, CCString} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData extends Component {

    @property({type:CCString})
    public UserName='tomato';
    @property({type:CCInteger})
    public money=0;

    @property({type:CCInteger})
    public TNTNum=3;
    @property({type:CCBoolean})
    public isDiamondPolish=false;
    @property({type:CCBoolean})
    public isStrengthen=false;
    @property({type:CCBoolean})
    public isLucky=false;
    @property({type:CCBoolean})
    public isRockAppreciate=false;

    @property({type:CCInteger})
    public score=0;

    private static instance:PlayerData = null;

    start() {
        let scene=director.getScene();
        let node=scene.getChildByName("PlayerData")
        director.addPersistRootNode(node);
        console.log('成功持久化节点')
    }

    update(deltaTime: number) {
        
    }
}

