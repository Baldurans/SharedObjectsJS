import {SharedObjectArray} from "../SharedObjectArray";
import {StateBufferExport} from "../StateBuffer";
import {SharedObjectSlaveArray} from "../SharedObjectSlaveArray";

export class ExampleMasterObjectArray extends SharedObjectArray<MasterObject> {

    private readonly main: Uint8Array;
    private readonly sec: Uint32Array;

    public constructor() {
        const maxObjects = 5;
        super(maxObjects);
        this.main = new Uint8Array(new SharedArrayBuffer(maxObjects * 3 * Uint8Array.BYTES_PER_ELEMENT));
        this.sec = new Uint32Array(new SharedArrayBuffer(maxObjects * 2 * Uint32Array.BYTES_PER_ELEMENT));
    }

    protected populateMemory(index: number, obj: MasterObject) {
        const pos = index * 3;
        const pos2 = index * 2;
        this.main[pos] = obj.metaId;
        this.main[pos + 1] = obj.x;
        this.main[pos + 2] = obj.y;
        this.sec[pos2] = obj.sx;
        this.sec[pos2 + 1] = obj.sy;
    }

    protected deleteMemory(index: number) {
        const pos = index * 3;
        const pos2 = index * 2;
        this.main[pos] = 0;
        this.main[pos + 1] = 0;
        this.main[pos + 2] = 0;
        this.sec[pos2] = 0;
        this.sec[pos2 + 1] = 0;
    }

    public export(): ExampleBuffersExport {
        return {
            ...super.export(),
            main: this.main.buffer as SharedArrayBuffer,
            sec: this.main.buffer as SharedArrayBuffer,
        }
    }
}

export interface MasterObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}

export class ExampleSlaveObjectArray extends SharedObjectSlaveArray<SlaveObject> {

    private readonly main: Uint8Array;
    private readonly sec: Uint32Array;

    public constructor(buffers: ExampleBuffersExport) {
        super(buffers);
        this.main = new Uint8Array(buffers.main)
        this.sec = new Uint32Array(buffers.sec)
    }

    protected updateObject(index: number, obj: SlaveObject | null): SlaveObject | null {
        if (!obj) {
            obj = {} as any;
        }
        if (this.main[index * 3] === 0) {
            return null;
        }
        const pos = index * 3;
        const pos2 = index * 2;
        obj.metaId = this.main[pos];
        obj.x = this.main[pos + 1];
        obj.y = this.main[pos + 2];
        obj.sx = this.sec[pos2];
        obj.sy = this.sec[pos2 + 1];
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

export interface ExampleBuffersExport extends StateBufferExport {
    main: SharedArrayBuffer;
    sec: SharedArrayBuffer;
}
