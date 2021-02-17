import { StateBuffer } from "./StateBuffer";
export interface StateBufferForMasterListeners<T> {
    populateMemory: (index: number, obj: T) => void;
    deleteMemory: (index: number) => void;
}
export declare class StateBufferForMaster<T extends object> extends StateBuffer {
    private readonly maxObjects;
    private readonly indexToObject;
    private readonly objectToIndex;
    private readonly dirty;
    private readonly listeners;
    protected noOfObjects: number;
    protected unusedIndexes: number[];
    private isFlushing;
    private flushInterval;
    static readonly FLUSH_FPS = 60;
    constructor(maxObjects: number, listeners: StateBufferForMasterListeners<T>);
    initPeriodicFlush(fps?: number): void;
    clearPeriodicFlush(): void;
    flushToMemorySync(): void;
    flushToMemory(): void;
    private _flushToMemory;
    private handleDirty;
    replaceObjectAt(index: number, object: T): void;
    dirtyObject(object: T): void;
    private getNextUnusedIndex;
    private addObjectToIndex;
    deleteObject(object: T): void;
    /**
     * Optimizes memory usage by moving all items to left if there are unused indexes. O(n)
     * Use this only if you understand when it is useful and when it is useless. addDirty reuses indexes that have been deleted.
     * In most cases you do not need this.
     */
    moveAllToLeft(): void;
    getArray(): Array<T | undefined>;
    get(index: number): T | undefined;
    export(): StateBufferExport;
}
export interface StateBufferExport {
    controlBuffer: SharedArrayBuffer;
    changesBuffer: SharedArrayBuffer;
    isDirtyBuffer: SharedArrayBuffer;
}
