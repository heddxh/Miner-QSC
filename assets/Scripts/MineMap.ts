import { Component, _decorator, Prefab, Node, instantiate, UITransform } from 'cc';
import { OreData } from './OreData';
const { ccclass, property } = _decorator;

@ccclass('MineMap')
export class MineController extends Component {

    @property({type: [Prefab], group: {name:"矿物预制体"}})
    public orePrefabs: Prefab[] = [];

    private _leftOres: Prefab[] = [];

    private _spawnedOre: number[] = [];
    private _contentSize: { width: number, height: number } = { width: 0, height: 0 };
    private _mapGrid: boolean[][] = [];
    private _gridWidth: number = 0;
    private _gridHeight: number = 0;
    private _columnCount: number = 4;
    private _rowCount: number = 4;  

    start() {
        this.init();
        this._leftOres = this.orePrefabs;
        let oreIndex = 0;
        for (let i = 0; i < 12; i++) {
            oreIndex = Math.floor(Math.random() * this._leftOres.length);
            this.spawnOre(instantiate(this.orePrefabs[oreIndex]));
            // this._leftOres.splice(oreIndex, 1);
        }
        
       
    }

    update(deltaTime: number) {
        
    }

    init() {
        this._contentSize = this.node.getComponent(UITransform).contentSize;
        this._gridWidth = this._contentSize.width / this._columnCount;
        this._gridHeight = this._contentSize.height / this._rowCount;
        for (let i = 0; i < this._rowCount; i++) {
            this._mapGrid.push([]);
            for (let j = 0; j < this._columnCount; j++) {
                this._mapGrid[i].push(false);
            }
        }
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
        ore.setPosition((randomColumn + 0.5) * this._gridWidth, (randomRow + 0.5) * this._gridHeight);
        return [randomRow, randomColumn];
    }
}

