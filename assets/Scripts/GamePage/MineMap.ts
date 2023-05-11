import {
    Component,
    _decorator,
    Prefab,
    Node,
    instantiate,
    UITransform,
    Vec3,
    tween,
} from "cc";
import { GameController } from "./GameController";
const { ccclass, property } = _decorator;

@ccclass("MineMap")
export class MineMap extends Component {
    @property({ type: [Prefab], group: { name: "矿物预制体" } })
    public orePrefabs: Prefab[] = [];

    @property
    public oreCount: number = 12;

    @property
    public BombNum: number = 3;

    // 是否持续生成
    @property
    public isContinuous: boolean = false;

    // 矿物数量限制
    private _spawnedOres: { [key: string]: number } = {
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

    private contentSize: { width: number; height: number } = {
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
        let oreIndex: number = 0;
        let ore: Node;
        for (let i = 0; i < this.oreCount; i++) {
            do {
                oreIndex = Math.floor(Math.random() * 10);
            } while (this._spawnedOres[this.orePrefabs[oreIndex].name] <= 0);
            this._spawnedOres[this.orePrefabs[oreIndex].name]--;
            ore = instantiate(this.orePrefabs[oreIndex]);
            this.spawnOre(ore);
            // 保存生成的石头
            if (this.orePrefabs[oreIndex].name == "EarlyEight" || this.orePrefabs[oreIndex].name == "EarlyTen") 
                this._rockNodes.push(ore);
        };
        // 保存空闲网格
        for (let i = 0; i < this._rowCount; i++) {
            for (let j = 0; j < this._columnCount; j++) {
                if (!this.mapGrid[i][j])
                    this.mapGridLeft.push({ r: j, c: i });
            }
        }
        console.log(this.mapGridLeft);
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
}
