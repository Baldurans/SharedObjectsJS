import {StateBuffer} from "./StateBuffer";

export interface StateBufferForMasterListeners<T> {
    populateMemory: (index: number, obj: T) => void;
    deleteMemory: (index: number) => void;
}

export class StateBufferForMaster<T extends object> extends StateBuffer {

    private readonly maxObjects: number;
    private readonly indexToObject: T[] = [];
    private readonly objectToIndex: Map<T, number> = new Map();
    private readonly dirty: Set<number> = new Set();
    private readonly listeners: StateBufferForMasterListeners<T>;

    protected noOfObjects: number = 0;
    protected unusedIndexes: number[] = [];

    private isFlushing = false;
    private flushInterval: ReturnType<typeof setInterval>;

    public static readonly FLUSH_FPS = 60;

    constructor(maxObjects: number, listeners: StateBufferForMasterListeners<T>) {
        super(maxObjects);
        this.maxObjects = maxObjects;
        this.listeners = listeners;
    }

    public initPeriodicFlush(fps?: number) {
        if (this.flushInterval) {
            return;
        }
        this.flushInterval = setInterval(() => {
            this.flushToMemory();
        }, Math.floor(1000 / (fps ? fps : StateBufferForMaster.FLUSH_FPS)));
    }

    public clearPeriodicFlush() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
    }

    public flushToMemorySync(): void {
        this.lock();
        this._flushToMemory();
        this.releaseLock();
    }

    public flushToMemory(): void {
        if (this.isFlushing === true) {
            return;
        }
        this.isFlushing = true;
        this.executeLocked(() => {
            this._flushToMemory();
            this.isFlushing = false;
        });
    }

    private _flushToMemory() {
        this.dirty.forEach((index) => {

            const obj = this.indexToObject[index];
            if (obj) {
                this.listeners.populateMemory(index, obj);
            } else {
                this.listeners.deleteMemory(index);
            }
            if (this.isDirtyBuffer[index] === StateBuffer.CLEAN) {
                const nextI = this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX]
                this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX]++;
                this.changesBuffer[nextI] = index;
                this.isDirtyBuffer[index] = StateBuffer.DIRTY;
            }
        });
        this.controlBuffer[StateBuffer.NO_OF_OBJECTS_INDEX] = this.noOfObjects;
        this.dirty.clear();
    }

    public replaceObjectAt(index: number, object: T) {
        if (this.indexToObject[index]) {
            this.deleteObject(this.indexToObject[index]);
        }
        if (this.objectToIndex.has(object)) {
            this.deleteObject(object);
        }
        if (index >= this.noOfObjects) {
            this.noOfObjects = index + 1;
        }
        this.addObjectToIndex(object, index);
    }

    public dirtyObject(object: T) {
        let index = this.objectToIndex.get(object);
        if (index === undefined) {
            if (this.unusedIndexes.length > 0) {
                index = this.getNextUnusedIndex();
            } else {
                if (this.noOfObjects === this.maxObjects) {
                    throw new Error("MAX objects reached!" + this.noOfObjects + "/" + this.maxObjects);
                }
                index = this.noOfObjects;
                this.noOfObjects++;
            }
            this.addObjectToIndex(object, index);
        } else {
            this.dirty.add(index);
        }
    }

    private getNextUnusedIndex(): number | undefined {
        while (true) {
            if (this.unusedIndexes.length === 0) {
                return undefined;
            }
            const index = this.unusedIndexes.pop();
            if (this.indexToObject[index] === undefined) {
                return index;
            }
        }
    }

    private addObjectToIndex(object: T, index: number) {
        this.objectToIndex.set(object, index);
        this.indexToObject[index] = object;
        this.dirty.add(index);
    }

    public deleteObject(object: T) {
        const index = this.objectToIndex.get(object);
        if (index === undefined) {
            return;
        }
        this.unusedIndexes.push(index);
        this.objectToIndex.delete(object);
        this.indexToObject[index] = undefined;
        this.dirty.add(index);
    }

    /**
     * Optimizes memory usage by moving all items to left if there are unused indexes. O(n)
     * Use this only if you understand when it is useful and when it is useless. addDirty reuses indexes that have been deleted.
     * In most cases you do not need this.
     */
    public moveAllToLeft() {
        let nextObjIndex = 0;
        for (let i = 0; i < this.indexToObject.length; i++) {
            const current = this.indexToObject[i];
            if (current === undefined) {
                continue;
            }

            if (nextObjIndex !== i) {
                this.objectToIndex.delete(current);
                this.indexToObject[i] = undefined;
                this.objectToIndex.set(current, nextObjIndex);
                this.indexToObject[nextObjIndex] = current;
                this.dirty.add(i);
                this.dirty.add(nextObjIndex);
            }

            nextObjIndex++;
        }
        this.unusedIndexes.length = 0;
        this.indexToObject.length = nextObjIndex;
        this.noOfObjects = nextObjIndex;
    }

    public getArray(): Array<T | undefined> {
        return this.indexToObject;
    }

    public get(index: number): T | undefined {
        return this.indexToObject[index];
    }

    public export(): StateBufferExport {
        return {
            controlBuffer: this.controlBuffer.buffer as SharedArrayBuffer,
            changesBuffer: this.changesBuffer.buffer as SharedArrayBuffer,
            isDirtyBuffer: this.isDirtyBuffer.buffer as SharedArrayBuffer
        }
    }
}

export interface StateBufferExport {
    controlBuffer: SharedArrayBuffer;
    changesBuffer: SharedArrayBuffer;
    isDirtyBuffer: SharedArrayBuffer;
}
