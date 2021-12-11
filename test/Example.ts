import {StateBufferForSlave} from "../src/StateBufferForSlave";
import {StateBufferForMaster} from "../src/StateBufferForMaster";

export class ExampleMasterObjectArray extends StateBufferForMaster<MasterObject> {

    public constructor(maxObjects: number) {
        super(maxObjects, 12);
    }

    protected populateMemory(index: number, obj: MasterObject) {
        const p8 = index * this.size8;
        const p32 = index * this.size32;
        this.view8[p8] = obj.metaId;
        this.view8[p8 + 1] = obj.x;
        this.view8[p8 + 2] = obj.y;
        this.view32[p32 + 1] = obj.sx;
        this.view32[p32 + 2] = obj.sy;
    }

}

export interface MasterObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}

export class ExampleSlaveObjectArray extends StateBufferForSlave<SlaveObject> {

    protected exists(index: number) {
        return this.view8[index * this.size8] !== 0;
    }

    protected isSame(index: number, obj: SlaveObject) {
        return obj.metaId === this.view8[index * this.size8];
    }

    protected updateObject(index: number, obj: SlaveObject | undefined): SlaveObject | undefined {
        const p8 = index * this.size8;
        const p32 = index * this.size32;
        obj.metaId = this.view8[p8];
        obj.x = this.view8[p8 + 1];
        obj.y = this.view8[p8 + 2];
        obj.sx = this.view32[p32 + 1];
        obj.sy = this.view32[p32 + 2];
        return obj;
    }
}

export interface SlaveObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}
