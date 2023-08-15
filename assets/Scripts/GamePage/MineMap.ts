import {
    Component,
    _decorator,
    Prefab,
    Node,
    instantiate,
    UITransform,
    Vec3,
    tween,
    Vec2,
} from "cc";
import { LevelConst, MapOrder, OreNumAllocation } from "../TrialHall/LevelConst";
import { GameController } from "./GameController";
const { ccclass, property } = _decorator;


type Size={width:number,height:number};
type Box={x:number,y:number,width:number,height:number};

@ccclass("MineMap")
export class MineMap extends Component {
    @property({ type: [Prefab], group: { name: "矿物预制体" } })
    public orePrefabs: Prefab[] = [];

    @property
    public oreCount: number = 12;

    @property
    public BombNum: number = 3;

    // 是否持续生成，关闭以开启无尽模式
    @property
    public isContinuous: boolean = false;
    

    @property({ type: [Prefab], group: { name: "特殊关卡" } })
    private specialLevel:Prefab[]=[];
    private speciallevelIndex:number=0;

    // 矿物数量限制
    private _spawnedOres:OreNumAllocation = {
        BareStudent: 1,
        CatGoldLarge: 2,
        CatGoldMiddle: 2,
        CatGoldSmall: 2,
        EarlyEight: 2,
        EarlyTen: 2,
        GptDiamond: 2,
        GptStudent: 1,
        RandomBag: 2,
        TNT: 0,
    };

    // 石头变钻石技能
    private _isRockAppreciate: boolean = false;
    private _rockNodes: Node[] = [];
    private _diamondIndex: number = 0;

    private contentSize:Size = {
        width: 0,
        height: 0,
    };

    private mapGrid: boolean[][] = [];  
    private mapGridLeft: { r: number; c: number }[] = [];
    private _gridWidth: number = 0;
    private _gridHeight: number = 0;
    private _posOffsetRange: { x: number; y: number } = { x: 0, y: 0 };
    private _columnCount: number = 4;
    private _rowCount: number = 4;

    start() {
        this.init();
        let ore: Node;
        if(!GameController.getPlayerData().isEndlessMode){
            //非无尽模式下随机分配矿石
            for (let i = 0; i < this.oreCount; i++) {
                //保留未生成矿石的名称列表
                const existKeys=Object.keys(this._spawnedOres).filter((key)=>{return this._spawnedOres[key]>0;});
                if(existKeys.length===0) break;
                //从中挑选一种矿石
                const oreIndex=this.findOreIndexByName(existKeys[
                    Math.floor(Math.random()*existKeys.length)
                ]);
                this._spawnedOres[this.orePrefabs[oreIndex].name]--;
                
                ore = instantiate(this.orePrefabs[oreIndex]);
                this.spawnOre(ore);
                // 保存生成的石头
                if (this.orePrefabs[oreIndex].name == "EarlyEight" || this.orePrefabs[oreIndex].name == "EarlyTen") 
                    this._rockNodes.push(ore);
            };
        }else{
            //无尽模式下按顺序分配矿石
            this.isContinuous=false;
            const order=LevelConst.getLevelMap(GameController.getPlayerData().level);
            if(order===null){
                //载入特殊关卡
                let specialLevel=instantiate(this.specialLevel[
                    (GameController.getPlayerData().level<10)?0:1]);
                this.node.addChild(specialLevel);
            }
            else{
                //载入普通有逻辑的关卡
                this.placeOreByOrder(order);
            }
        }
        // 保存空闲网格，无尽模式由于不需要持续生成，因此不用记录空闲网格
        for (let i = 0; i < this._rowCount; i++) {
            for (let j = 0; j < this._columnCount; j++) {
                if (!this.mapGrid[i][j])
                    this.mapGridLeft.push({ r: j, c: i });
            }
        }
    }

    update(deltaTime: number) {
        if (!GameController.getIsGameOver()) {
            //游戏进行中

            // 石头变钻石技能
            if (this._isRockAppreciate && this._rockNodes.length > 0) {
                this._isRockAppreciate = false;
                console.log("早八，给我变！");
                let randomIndex = Math.floor(Math.random() * this._rockNodes.length);
                let rockChangedNode = this._rockNodes[randomIndex];
                let pos: Vec3 = rockChangedNode.getPosition();
                // FIXME: 暂停节点监听
                // this.node.pauseSystemEvents(true);
                // console.log("暂停节点监听");
                

                // 播放动画tween
                tween()
                    .target(rockChangedNode)
                    .to(0.5, { angle: 360,scale:Vec3.ZERO}) // 旋转一圈并消失
                    .call (() => {
                        rockChangedNode.destroy();
                        let diamond = instantiate(this.orePrefabs[this._diamondIndex]);
                        
                        let oriScale:Vec3 = diamond.getScale();
                        diamond.setScale(Vec3.ZERO);

                        tween()
                        .target(diamond)
                        .to(0.4, { angle: 360 ,scale:oriScale})
                        .start();

                        this.node.addChild(diamond);
                        diamond.setPosition(pos);
                    }).start();

                // 恢复节点监听
                // this.node.resumeSystemEvents(true);
            }

            // 持续生成
            if (this.isContinuous) {
                if (this.mapGridLeft.length > 3) {
                    let oreIndex = Math.floor(Math.random() * 10);
                    let ore = instantiate(this.orePrefabs[oreIndex]);
                    let gridPos = this.spawnOre(ore);
                    
                    let oriScale:Vec3 = ore.getScale();
                    ore.setScale(Vec3.ZERO);
                    
                    tween()
                        .target(ore)
                        .to(1.0, { angle: 360 ,scale:oriScale})
                        .start();


                    // console.log(gridPos);
                    this.mapGridLeft.splice(this.mapGridLeft.indexOf({ r: gridPos[0], c: gridPos[1] }));
                    // console.log(this.mapGridLeft);
                    console.log("生成了：" + ore.name);
                }
            }
        }
    }

    init() {
        // 找到钻石预置体下标
        for (let i = 0; i < this.orePrefabs.length; i++) {
            if (this.orePrefabs[i].name == "GptDiamond") {
                this._diamondIndex = i;
                break;
            }
        }

        // 获取边界，生成网格
        this.contentSize = this.node.getComponent(UITransform).contentSize;
        this._gridWidth = this.contentSize.width / this._columnCount;
        this._gridHeight = this.contentSize.height / this._rowCount;
        this._posOffsetRange = {
            x: this._gridWidth / 4,
            y: this._gridHeight / 4,
        };
        for (let i = 0; i < this._rowCount; i++) {
            this.mapGrid.push([]);
            for (let j = 0; j < this._columnCount; j++) {
                this.mapGrid[i].push(false);
            }
        }

        // TNT 数量
        this._spawnedOres["TNT"] = this.BombNum;

        // 是否启用石头变钻石技能
        this._isRockAppreciate = GameController.getRockAppreciate();
        console.log("石头变钻石技能：" + this._isRockAppreciate);
    }

    spawnOre(ore: Node): [number, number] {
        // 随机选择格子
        let randomRow = Math.floor(Math.random() * this._rowCount);
        let randomColumn = Math.floor(Math.random() * this._columnCount);
        while (this.mapGrid[randomRow][randomColumn]) {
            randomRow = Math.floor(Math.random() * this._rowCount);
            randomColumn = Math.floor(Math.random() * this._columnCount);
        }
        this.mapGrid[randomRow][randomColumn] = true;
        this.node.addChild(ore);

        // 注册父节点改变事件以监听是否上钩(包括爆炸)
        ore.on(Node.EventType.NODE_DESTROYED, () => {
            if (!GameController.getIsGameOver()) {
                // 游戏开始后才计入
                this.mapGrid[randomRow][randomColumn] = false;
                this.mapGridLeft.push({ r: randomRow, c: randomColumn });
                console.log(ore.name + "被销毁 " + randomRow + "," + randomColumn);
                // console.log(this.mapGridLeft);
            }
        }); 

        // 位置偏移
        let posOffset = new Vec3(
            Math.random() * this._posOffsetRange.x,
            Math.random() * this._posOffsetRange.y,
            0
        );
        posOffset.x = Math.random() > 0.5 ? posOffset.x : -posOffset.x;
        posOffset.y = Math.random() > 0.5 ? posOffset.y : -posOffset.y;
        ore.setPosition(
            (randomColumn + 0.5) * this._gridWidth + posOffset.x,
            (randomRow + 0.5) * this._gridHeight + posOffset.y,
            0
        );
        return [randomRow, randomColumn];
    }

    findOreIndexByName(name:string):number{
        return this.orePrefabs.findIndex((prefab)=>{
            return (prefab.name===name);
        });
    }

    //mapOrder以百分比网格和矩形装箱的形式分配矿石。(因为矿石尺寸各异)
    //利用oreLogic上的getBoundingBox方法获取包围盒
    private placeOreByOrder(mapOrder:MapOrder){
        for(let oneOrder of mapOrder){
            //记录百分比网格包围盒大小/初始化箱子大小
            const shelfs=[{x:(this.contentSize.width)*(oneOrder.startX),y:(this.contentSize.width)*(oneOrder.startY),
                width:(this.contentSize.width)*(oneOrder.endX-oneOrder.startX),height:(this.contentSize.height)*(oneOrder.endY-oneOrder.startY)}];
            //针对每一个矿物的包围盒进行装箱。
            const Allocation:OreNumAllocation=Object.assign(oneOrder.allocate);
            let existKeys=[];
            do{
                //保留未生成矿石的名称列表
                existKeys=Object.keys(Allocation).filter((key)=>{return Allocation[key]>0;});
                //从中挑选一种矿石，若没有矿石，直接退出
                if(existKeys.length===0) break;
                const oreIndex=this.findOreIndexByName(existKeys[
                    Math.floor(Math.random()*existKeys.length)
                ]);
                if(oreIndex===-1){
                    console.error("cannot find a rare ore, whose name can't be recognized");
                    break;
                }
                Allocation[this.orePrefabs[oreIndex].name]--;
                //矩形装箱，确定该矿石位置
                const newOre=instantiate(this.orePrefabs[oreIndex]);
                //空出外边框
                const newOreSize=Object.assign(newOre.getComponent(UITransform).contentSize);
                const marginTop:number=LevelConst.getOreMarginTop(newOreSize.height);
                const marginLeft:number=LevelConst.getOreMarginLeft(newOreSize.width);
                newOreSize.height+=marginTop*2;
                newOreSize.width+=marginLeft*2;

                //塞入随机的空矿位，
                if(LevelConst.rollWhetherGap()) this.shelfOneIntoGrid(shelfs,LevelConst.getOreGap());
                
                //寻找位置
                let posi=this.shelfOneIntoGrid(shelfs,newOreSize);
                //塞不下，不管(已经减去)；塞得下，渲染矿石
                if(posi===Vec3.ZERO) continue;
                else{
                    //抖动
                    posi=posi.add3f(LevelConst.randBetween(-marginLeft,marginLeft),
                    LevelConst.randBetween(-marginTop,marginTop),0);
                    this.node.addChild(newOre);
                    newOre.setPosition(posi);
                }
                //将石头加入待变列表
                if (this.orePrefabs[oreIndex].name == "EarlyEight" || this.orePrefabs[oreIndex].name == "EarlyTen") 
                    this._rockNodes.push(newOre);
            }while(existKeys.length>0);
        }
    }

    /**网格中塞一矿石-货架算法
     * 简单地，从小到大(以宽度为度量)遍历空位，如有空位即塞入，剩余空位中，空位太小即舍去
     * 塞不下返回ZERO
     */
    private shelfOneIntoGrid(shelfs:Box[],content:Size):Vec3{
        for(let i=0;i<shelfs.length;i++){
            //找到能塞下的空间
            if(shelfs[i].height>=content.height && shelfs[i].width>=content.width){
                //产生两个新空间
                const rightBox:Box={x:shelfs[i].x+content.width,y:shelfs[i].y,
                    width:shelfs[i].width-content.width,height:content.height};
                const topBox:Box={x:shelfs[i].x,y:shelfs[i].y+content.height,
                width:shelfs[i].width,height:shelfs[i].height-content.height};
                //在改变空间列表前先存储位置数据
                let retPosi:Vec3=new Vec3(shelfs[i].x+content.width/2,shelfs[i].y+content.height/2,0);
                //删除原有的空间
                shelfs.splice(i,1);
                //插入新的空间,宽度优先
                this.insertShelf(rightBox,shelfs);
                this.insertShelf(topBox,shelfs);
                //返回中心位置
                return retPosi;
            }
        }
        return Vec3.ZERO
    }

    //最小宽度，为钻石的宽度。
    private static readonly MinWidth= 50;

    
    private insertShelf(newShelf:Box,shelfs:Box[]):void{
        if(newShelf.height<MineMap.MinWidth || newShelf.width<MineMap.MinWidth)
            return;
        let index:number=shelfs.length-1;
        while(index>=0 && shelfs[index].width>newShelf.width){
            shelfs[index+1]=shelfs[index];
            index--;
        }
        shelfs[index+1]=newShelf;
    }

    /** 往网格中放置一个矿石-天际线算法。
     * @param skyLines 上界线的集合，存储目前最高平面
     * @param cornerPoints 角落点集，集合长度比上界线集合长度多一，
     * 分为两类，左端点的索引i保证i=0或skyLines[i-1]>skyLines[i]；右端点的索引i保证i=len-1或skyLines[i]>skyLines[i+1]
     * @param content 要放置矿物的大小
     * @return 放置该矿物位置的中心点，如果放不下，返回零向量ZERO
     */
    private placeOneIntoGrid(skyLines:number[],cornerPoints:Vec3[],content:Size):Vec3{
        //寻找最低点
        
        return Vec3.ZERO;
    }
}
