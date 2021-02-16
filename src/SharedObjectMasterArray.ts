import {StateBufferExport, StateBufferForMaster} from "./StateBufferForMaster";

export abstract class SharedObjectMasterArray<T extends object> {

    private readonly stateBuffer: StateBufferForMaster<T>;

    protected constructor(maxObjects: number) {
        this.stateBuffer = new StateBufferForMaster(maxObjects, {
            populateMemory: (index, obj) => {
                this.populateMemory(index, obj)
            },
            deleteMemory: (index, obj) => {
                this.deleteMemory(index, obj)
            }
        });
    }

    protected abstract populateMemory(index: number, obj: T): void;

    protected abstract deleteMemory(index: number, obj: T): void;

    public replaceObjectAtIndex(index: number, object: T) {
        this.stateBuffer.replaceObjectAtIndex(index, object);
    }

    public flushToMemory() {
        this.stateBuffer.flushToMemory();
    }

    public flushToMemorySync() {
        this.stateBuffer.flushToMemorySync();
    }

    public addDirtyObject(obj: T) {
        this.stateBuffer.addDirtyObject(obj);
    }

    public addDeletedObject(obj: T) {
        this.stateBuffer.addDeletedObject(obj);
    }

    public export(): StateBufferExport {
        return this.stateBuffer.export();
    }

    public getArray(): Array<T | undefined> {
        return this.stateBuffer.getArray();
    }

    public get(index: number): T | undefined {
        return this.stateBuffer.get(index);
    }
}
