import {
    Component,
    _decorator,
    Prefab,
    Node,
    instantiate,
    UITransform,
    Vec3,
    find
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("MineMap")
export class MineMap extends Component {
    @property({ type: [Prefab], group: { name: "矿物预制体" } })
    public orePrefabs: Prefab[] = [];

    @property
    public oreCount: number = 12;

    @property
    public BombNum: number = 3;

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

    public contentSize: { width: number; height: number } = {
        width: 0,
        height: 0,
    };

    private _mapGrid: boolean[][] = [];
    private _gridWidth: number = 0;
    private _gridHeight: number = 0;
    private _posOffsetRange: { x: number; y: number } = { x: 0, y: 0 };
    private _columnCount: number = 4;
    private _rowCount: number = 4;

    start() {
        this.init();
        let oreIndex: number = 0;
        for (let i = 0; i < this.oreCount; i++) {
            do {
                oreIndex = Math.floor(Math.random() * 10);
            } while (this._spawnedOres[this.orePrefabs[oreIndex].name] <= 0);
            this._spawnedOres[this.orePrefabs[oreIndex].name]--;
            this.spawnOre(instantiate(this.orePrefabs[oreIndex]));
        }
    }

    update(deltaTime: number) {}

    init() {
        // 获取边界，生成网格
        this.contentSize = this.node.getComponent(UITransform).contentSize;
        this._gridWidth = this.contentSize.width / this._columnCount;
        this._gridHeight = this.contentSize.height / this._rowCount;
        this._posOffsetRange = {
            x: this._gridWidth / 4,
            y: this._gridHeight / 4,
        };
        for (let i = 0; i < this._rowCount; i++) {
            this._mapGrid.push([]);
            for (let j = 0; j < this._columnCount; j++) {
                this._mapGrid[i].push(false);
            }
        }

        this._spawnedOres["TNT"] = this.BombNum;
    }

    spawnOre(ore: Node): [number, number] {
        // 随机选择格子
        let randomRow = Math.floor(Math.random() * this._rowCount);
        let randomColumn = Math.floor(Math.random() * this._columnCount);
        while (this._mapGrid[randomRow][randomColumn]) {
            randomRow = Math.floor(Math.random() * this._rowCount);
            randomColumn = Math.floor(Math.random() * this._columnCount);
        }
        this._mapGrid[randomRow][randomColumn] = true;
        this.node.addChild(ore);

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