import { CommoType } from "../ShopPage/ShopLogic";

//矿图分配逻辑：多个百分比团块，每个团块内安排矿石数量
export type MapOrder={
    startX:number,endX:number,startY:number,endY:number,
    allocate:OreNumAllocation}[];
export interface OreNumAllocation{
    BareStudent?:number;
    CatGoldLarge?: number,
    CatGoldMiddle?: number,
    CatGoldSmall?: number,
    EarlyEight?: number,
    EarlyTen?: number,
    GptDiamond?: number,
    GptStudent?: number,
    RandomBag?: number,
    TNT?: number,
};
export namespace LevelConst{
    /**奖励关的地图信息*/
    const getCreditLevel=[3,5,10];
    const CreditLevel:{[key:number]:MapOrder}={
        //第三关，石头缝中挑钻石
        3:[{
            startX:0.1,endX:0.5,startY:0.32,endY:1,
            allocate:{
                GptDiamond:1,
                EarlyEight:1,
                EarlyTen:3,
            }
        },{
            startX:0.5,endX:1,startY:0.3,endY:0.9,
            allocate:{
                GptDiamond:2,
                EarlyEight:2,
                EarlyTen:2,
            }
        },{
            startX:0.1,endX:1,startY:0,endY:0.32,
            allocate:{
                RandomBag:1,
                GptDiamond:2,
                EarlyTen:2,
            }
        }],
        //第五关，爬爬国度
        5:[{
            startX:0.05,endX:1,startY:0.45,endY:1,
            allocate:{
                EarlyTen:2,
                BareStudent:5,
                CatGoldSmall:2,
            }
        },{
            startX:0.4,endX:1,startY:0,endY:0.5,
            allocate:{
                BareStudent:2,
                EarlyTen:1,
                GptStudent:2,
                CatGoldMiddle:1,
            }
        },
        ],
        //第十关，炸药堆中挑钻石
        10:[{
            startX:0,endX:0.6,startY:0,endY:0.98,
            allocate:{
                GptDiamond:2,
                TNT:2,
                CatGoldMiddle:2,
            }
        },{
            startX:0.58,endX:1,startY:0,endY:0.95,
            allocate:{
                TNT:4,
                GptDiamond:4,
                CatGoldSmall:3,
                CatGoldMiddle:1,
            }
        },
        ],
    };
    /**特殊关卡的信息，这些关卡直接使用地图预制品，不使用矿石分布*/
    //第八关，zju黄金钻石阵；第十五关，qsc钻石。
    const getSpecialLevel=[8,15];
    export const getLevelMap=(level:number):MapOrder|null=>{
        if(getSpecialLevel.indexOf(level)!==-1) return null;

        if(Object.keys(CreditLevel).indexOf(level.toString())!==-1){
            return CreditLevel[level];
        }else{
            return makeNormalMap(level);
        }
    }

    /**根据关卡返回可用时间，单位为秒，注意上述奖励关的分配*/
    export const getLevelTime=(level:number):number=>{
        if(level<getCreditLevel[1]){
            return 40;
        }else if(level<getCreditLevel[2]){
            return 42;
        }else if(getSpecialLevel.indexOf(level)!==-1){
            return 28;
        }
        return 40+randBetween(-5,8);
    }

    /**根据关卡返回目标分,注意上述奖励关的分配*/
    export const getLevelTarget=(level:number,lastTarget:number):number=>{
        let addTarget=0;
        if(level<getCreditLevel[0])
            addTarget=500;
        else if(level===getCreditLevel[0])
            addTarget=1000;
        else if(level<getSpecialLevel[0])
            addTarget=1200+randBetween(0,600);
        else if(level===getSpecialLevel[0])
            //really special!
            addTarget=3500;
        else if(level<getCreditLevel[2])
            addTarget=1100;
        else if(level===getCreditLevel[2])
            addTarget=900;
        else if(level<getSpecialLevel[1])
            addTarget=1100;
        else if(level===getSpecialLevel[1])
            //really special!
            addTarget=5000;
        else addTarget=950+randBetween(0,450);
        return lastTarget+addTarget;
    }

    //根据当前关卡半随机地生成矿图
    function makeNormalMap(level:number):MapOrder{
        let ret:MapOrder=[];
        if(level<3){
            ret.push({
                startX:0,endX:0.6,startY:0.4,endY:1,
                allocate:{
                    CatGoldSmall:randBetween(2,4),
                    CatGoldMiddle:randBetween(2,3),
                    EarlyEight:randBetween(0,1),
                    EarlyTen:randBetween(1,4),
                }
            },{
                startX:0.6,endX:1,startY:0.38,endY:0.95,
                allocate:{
                    CatGoldMiddle:randBetween(1,3),
                    EarlyTen:randBetween(2,4),
                    RandomBag:randBetween(0,randBetween(0,1)),
                    CatGoldSmall:randBetween(2,3),
                }
            },{
                startX:0.1,endX:0.95,startY:0,endY:0.4,
                allocate:{
                    //对高价值矿物采取更精准的概率调控
                    CatGoldLarge:(randBetween(0,2)===0)?((randBetween(0,3)===0)?3:2):1,
                    EarlyEight:randBetween(0,1),
                }
            });
        }else if(level<7){
            //添加钻石
            ret.push({
                startX:0.05,endX:0.98,startY:0.5,endY:0.95,
                allocate:{
                    GptDiamond:(randBetween(0,2)===0)?(randBetween(0,4)===0?3:2):1,
                    EarlyEight:randBetween(1,2),
                    EarlyTen:randBetween(2,4),
                    CatGoldMiddle:randBetween(1,4),
                    CatGoldSmall:randBetween(1,5),
                    RandomBag:randBetween(0,1),
                }
            },{
                startX:0.5,endX:0.95,startY:0,endY:0.8,
                allocate:{
                    CatGoldLarge:randBetween(1,3),
                    RandomBag:randBetween(0,2),
                    GptDiamond:(randBetween(0,2)===0)?((randBetween(0,4)===0)?2:1):0,
                    EarlyEight:randBetween(0,2),
                    CatGoldSmall:randBetween(0,3),
                }
            });
        }else if(level<=10){
            //添加毛孩
            ret.push({
                startX:0.05,endX:0.6,startY:0.4,endY:0.95,
                allocate:{
                    CatGoldSmall:randBetween(2,4),
                    BareStudent:randBetween(1,5),
                    EarlyEight:randBetween(1,3),
                    EarlyTen:2,
                    RandomBag:1,
                }
            },
            {
                startX:0.62,endX:0.98,startY:0.05,endY:0.88,
                allocate:{
                    CatGoldMiddle:2,
                    BareStudent:randBetween(2,4),
                    EarlyTen:1,
                    GptStudent:(randBetween(0,2)===0)?((randBetween(0,1)===0)?2:1):0,
                }
            },{
                startX:0,endX:0.6,startY:0,endY:0.4,
                allocate:{
                    GptStudent:randBetween(1,2),
                    CatGoldLarge:(randBetween(0,1)===0)?((randBetween(0,3)===0)?2:1):0,
                    GptDiamond:(randBetween(0,2)===0)?((randBetween(0,4)===0)?3:2):1,
                }
            });
        }else if(level<15){
            //添加炸药桶(非常剧烈)
            ret.push({
                startX:0.05,endX:0.5,startY:0.1,endY:0.85,
                allocate:{
                    TNT:randBetween(1,3),
                    GptDiamond:1,
                    CatGoldLarge:1,
                    CatGoldMiddle:randBetween(1,3),
                    GptStudent:(randBetween(0,1)===0)?((randBetween(0,4)===0)?3:2):1,
                    EarlyEight:2,
                }
            },
            {
                startX:0.52,endX:1,startY:0.05,endY:0.75,
                allocate:{
                    TNT:randBetween(2,4),
                    GptDiamond:(randBetween(0,2)===0)?((randBetween(0,3)===0)?2:1):0,
                    BareStudent:randBetween(2,4),
                    EarlyEight:1,
                    EarlyTen:2,
                    CatGoldLarge:randBetween(1,2),
                    CatGoldSmall:randBetween(1,4),
                    RandomBag:randBetween(0,1),
                }
            });
        }else{
            //综合关卡
            ret.push({
                startX:0.05,endX:0.5,startY:0.4,endY:0.95,
                allocate:{
                    TNT:randBetween(0,2),
                    CatGoldMiddle:randBetween(1,3),
                    GptStudent:(randBetween(0,2)===0)?((randBetween(0,1)===0)?2:1):0,
                    EarlyEight:randBetween(0,2),
                    EarlyTen:randBetween(1,3),
                    CatGoldSmall:randBetween(1,4),
                    RandomBag:randBetween(0,1),
                }
            },
            {
                startX:0.52,endX:1,startY:0.38,endY:0.85,
                allocate:{
                    TNT:(randBetween(0,2)===0)?((randBetween(0,2)===0)?((randBetween(0,1)===0)?3:2):1):0,
                    GptDiamond:(randBetween(0,1)===0)?((randBetween(0,1)===0)?((randBetween(0,1)===0)?3:2):1):0,
                    BareStudent:randBetween(0,4),
                    EarlyEight:(randBetween(0,2)===0)?((randBetween(0,1)===0)?2:2):1,
                    EarlyTen:randBetween(1,5),
                    CatGoldLarge:(randBetween(0,1)===0)?((randBetween(0,2)===0)?((randBetween(0,1)===0)?3:2):1):0,
                    CatGoldSmall:randBetween(1,5),
                    CatGoldMiddle:randBetween(1,4),
                }
            },{
                startX:0,endX:0.65,startY:0.02,endY:0.38,
                allocate:{
                    TNT:randBetween(0,1),
                    GptDiamond:(randBetween(0,1)===0)?((randBetween(0,2)===0)?((randBetween(0,3)===0)?3:0):2):1,
                    CatGoldMiddle:1,
                    CatGoldLarge:(randBetween(0,1)===0)?((randBetween(0,2)===0)?((randBetween(0,2)===0)?3:0):2):1,
                    RandomBag:(randBetween(0,1)===0)?((randBetween(0,2)===0)?2:1):0,
                    GptStudent:(randBetween(0,1)===0)?((randBetween(0,2)===0)?((randBetween(0,3)===0)?3:2):1):0,
                }
            },{
                startX:0.62,endX:1,startY:0, endY:0.4,
                allocate:{
                    GptDiamond:(randBetween(0,3)===0)?1:0,
                    CatGoldLarge:(randBetween(0,3)===0)?1:0,
                    BareStudent:randBetween(0,1),
                    CatGoldSmall:randBetween(0,2),
                    GptStudent:(randBetween(0,2)===0)?1:0,
                }
            });
        }
        return ret;
    }

    //最初的价格
    export const OriginalPrice:[number,number,number,number,number]=[75,80,75,50,150];
    //根据关卡调整道具价钱(疯狂涨价hhh)
    //1.上次买了该物品，涨价30-150，
    //2.上次没买该物品，降价20-100,
    //3.每加一关，物价上涨1%-5%不等。
    //一些特殊的关卡某物品会飞速增长
    export function getPriceAdjust(level:number,commoType:CommoType,hasBought:boolean):number{
        let ret=OriginalPrice[commoType];
        ret*=(Math.random()*0.06+1.01)*((level<15)?(Math.ceil(level/4)):6);
        ret=Math.round(ret);
        if(hasBought){
            ret+=randBetween(30,200);
        }else if(ret>120){
            ret-=randBetween(50,110);
        }
        if(commoType===CommoType.DIAMOND && ((Object.keys(CreditLevel).indexOf(level.toString()))!==-1
            || level===getSpecialLevel[1]))
            ret+=600;
        if(commoType===CommoType.STRENGTH && getSpecialLevel.indexOf(level)!==-1)
            ret+=400;
        return ret;
    }

    export function randBetween(start:number,end:number):number{
        return Math.floor(Math.random()*(end-start+1)+start);
    }
    export function getOreMarginTop(height:number):number{
        return Math.floor(Math.sqrt(height)*2);
    }
    export function getOreMarginLeft(width:number):number{
        return Math.floor(Math.sqrt(width)*1.2);
    }
    export function getOreGap():{width:number,height:number}{
        //用于隔绝一行，强制远离或换行。
        return {width:randBetween(50,450),height:randBetween(50,150)};
    }
    export function rollWhetherGap():boolean{
        return randBetween(0,4)<=2;
    }
}