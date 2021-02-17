import { StateBufferExport } from "./StateBufferForMaster";
export declare abstract class SharedObjectMasterArray<T extends object> {
    private readonly stateBuffer;
    protected constructor(maxObjects: number);
    protected abstract populateMemory(index: number, obj: T): void;
    protected abstract deleteMemory(index: number): void;
    replaceObjectAtIndex(index: number, object: T): void;
    initPeriodicFlush(fps?: number): void;
    clearPeriodicFlush(): void;
    flushToMemory(): void;
    flushToMemorySync(): void;
    dirtyObject(obj: T): void;
    deleteObject(obj: T): void;
    moveAllToLeft(): void;
    export(): StateBufferExport;
    getArray(): Array<T | undefined>;
    get(index: number): T | undefined;
}
