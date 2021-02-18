import {StateBufferExport, StateBufferForMaster} from "./StateBufferForMaster";

export abstract class SharedObjectArrayMaster<T extends object> {

    private readonly stateBuffer: StateBufferForMaster<T>;

    protected constructor(maxObjects: number) {
        this.stateBuffer = new StateBufferForMaster(maxObjects, {
            populateMemory: (index, obj) => {
                this.populateMemory(index, obj)
            },
            deleteMemory: (index) => {
                this.deleteMemory(index)
            }
        });
    }

    protected abstract populateMemory(index: number, obj: T): void;

    protected abstract deleteMemory(index: number): void;

    public replaceObjectAtIndex(index: number, object: T) {
        this.stateBuffer.replaceObjectAt(index, object);
    }

    public initPeriodicFlush(fps?: number) {
        this.stateBuffer.initPeriodicFlush(fps);
    }

    public clearPeriodicFlush() {
        this.stateBuffer.clearPeriodicFlush();
    }

    public flushToMemory() {
        this.stateBuffer.flushToMemory();
    }

    public flushToMemorySync() {
        this.stateBuffer.flushToMemorySync();
    }

    public dirtyObject(obj: T) {
        this.stateBuffer.dirtyObject(obj);
    }

    public deleteObject(obj: T) {
        this.stateBuffer.deleteObject(obj);
    }

    public moveAllToLeft() {
        this.stateBuffer.moveAllToLeft();
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
