import {StateBuffer, StateBufferExport} from "./StateBuffer";

export interface StateBufferForMasterListeners<T> {
    populateMemory: (index: number, obj: T) => void;
    deleteMemory: (index: number, obj: T) => void;
}

export class StateBufferForMaster<T extends object> extends StateBuffer {

    private readonly indexToObject: Map<number, T> = new Map();
    private readonly objectToIndex: Map<T, number> = new Map();
    private readonly dirty: Set<T> = new Set();
    private readonly deleted: Set<T> = new Set();
    private readonly listeners: StateBufferForMasterListeners<T>;

    protected noOfObjects: number = 0;
    protected unusedIndexes: number[] = [];

    private isFlushing = false;

    constructor(maxObjects: number, listeners: StateBufferForMasterListeners<T>) {
        super(maxObjects);
        this.listeners = listeners;
    }

    public flushToMemory(): void {
        if (this.isFlushing === true) {
            return;
        }
        this.isFlushing = true;
        this.executeLocked(() => {
            this.handleDirty();
            this.handleDeleted();
            this.controlBuffer[StateBuffer.NO_OF_OBJECTS_INDEX] = this.noOfObjects;
            this.isFlushing = false;
        });
    }

    private handleDirty() {
        this.dirty.forEach((obj) => {
            if (this.deleted.has(obj)) {
                return;
            }

            let index = this.objectToIndex.get(obj);
            if (index === undefined) {
                if (this.unusedIndexes.length > 0) {
                    index = this.unusedIndexes.pop();
                } else {
                    index = this.noOfObjects;
                    this.noOfObjects++;
                }
                this.objectToIndex.set(obj, index);
            }

            this.registerDirtyIndex(index);

            this.listeners.populateMemory(index, obj);
        });
        this.dirty.clear();
    }

    private handleDeleted() {
        this.deleted.forEach((obj) => {
            let index = this.objectToIndex.get(obj);
            if (index !== undefined) {
                this.objectToIndex.delete(obj);
                this.indexToObject.delete(index);
                this.unusedIndexes.push(index);
                this.registerDirtyIndex(index);
                this.listeners.deleteMemory(index, obj);
            }
        });
        this.dirty.clear();
        this.deleted.clear();
    }

    private registerDirtyIndex(index: number) {
        if (!this.isDirtyBuffer[index]) {
            const nextI = this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX]
            this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX]++;
            this.changesBuffer[nextI] = index;
            this.isDirtyBuffer[index] = 1;
        }
    }

    public replaceObjectAtIndex(index: number, object: T) {
        const existingObj = this.indexToObject.get(index);
        if (existingObj) {
            this.indexToObject.delete(index);
            this.objectToIndex.delete(existingObj);
            this.dirty.delete(existingObj);
            this.deleted.delete(existingObj);
        }
        this.indexToObject.set(index, object);
        this.objectToIndex.set(object, index);
        this.dirty.add(object);
    }

    public addDirtyObject(object: T) {
        this.dirty.add(object);
    }

    public addDeletedObject(object: T) {
        this.deleted.add(object);
    }

    public export(): StateBufferExport {
        return {
            controlBuffer: this.controlBuffer.buffer as SharedArrayBuffer,
            changesBuffer: this.changesBuffer.buffer as SharedArrayBuffer,
            isDirtyBuffer: this.isDirtyBuffer.buffer as SharedArrayBuffer
        }
    }
}
