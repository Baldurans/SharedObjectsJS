import { StateBuffer } from "./StateBuffer";
import { StateBufferExport } from "./StateBufferForMaster";
export interface StateBufferForMasterListeners<T> {
    updateObject: (index: number, obj: T | null) => T | null;
}
export declare class StateBufferForSlave<T> extends StateBuffer {
    private readonly listeners;
    private readonly objects;
    constructor(buffers: StateBufferExport, listeners: StateBufferForMasterListeners<T>);
    init(): void;
    sync(): StateBufferForSlaveChanges<T>;
    getArray(): Array<T | undefined>;
    get(index: number): T | undefined;
}
export interface StateBufferForSlaveChanges<T> {
    deleted: T[];
    updated: T[];
}
