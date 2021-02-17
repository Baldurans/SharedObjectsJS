import { SharedObjectMasterArray } from "../lib/SharedObjectMasterArray";
import { SharedObjectSlaveArray } from "../lib/SharedObjectSlaveArray";
import { StateBufferExport } from "../lib/StateBufferForMaster";
export declare class ExampleMasterObjectArray extends SharedObjectMasterArray<MasterObject> {
    private readonly main;
    private readonly sec;
    constructor(maxObjects: number);
    protected populateMemory(index: number, obj: MasterObject): void;
    protected deleteMemory(index: number): void;
    export(): ExampleBuffersExport;
}
export interface MasterObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}
export declare class ExampleSlaveObjectArray extends SharedObjectSlaveArray<SlaveObject> {
    private readonly main;
    private readonly sec;
    constructor(buffers: ExampleBuffersExport);
    protected updateObject(index: number, obj: SlaveObject | null): SlaveObject | null;
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
