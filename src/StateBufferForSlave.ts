import {StateBuffer, StateBufferExport} from "./StateBuffer";

export abstract class StateBufferForSlave<T> extends StateBuffer {

    private readonly objects: T[] = [];
    private readonly objectsSet: Set<T> = new Set();
    private isInitialized = false;

    constructor(buffers: StateBufferExport) {
        super(buffers);
    }

    protected abstract exists(index: number): boolean;

    protected abstract isSame(index: number, obj: T): boolean;

    protected abstract onNew(index: number): T | undefined;

    protected abstract onUpdate(index: number, obj: T | undefined): void;

    protected abstract onDelete(index: number, obj: T | undefined): void;

    public sync(): boolean {
        const handleObject = (changeIndex: number, objIndex: number, obj: T) => {
            if (this.exists(objIndex)) {
                if (obj && this.isSame(objIndex, obj)) {
                    this.onUpdate(objIndex, obj);
                } else {
                    if (obj) {
                        this.onDelete(objIndex, obj);
                        this.objects[objIndex] = undefined;
                        this.objectsSet.delete(obj);
                    }
                    const newObj = this.onNew(objIndex);
                    this.objects[objIndex] = newObj;
                    this.objectsSet.add(newObj);
                    this.onUpdate(objIndex, newObj);
                }
            } else if (obj) {
                this.onDelete(objIndex, obj);
                this.objects[objIndex] = undefined;
                this.objectsSet.delete(obj);
            }
            this.isDirtyBufferView[objIndex] = StateBuffer.CLEAN;
            this.changesBufferView[changeIndex] = 0;
        };
        this.lock();
        let hadChanges;
        if (this.isInitialized === false) {
            this.isInitialized = true;
            hadChanges = true;
            const noOfObjects = this.controlBufferView[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            for (let i = 0; i < noOfObjects; i++) {
                handleObject(i, i, undefined);
            }
        } else {
            const noOfChanges = this.controlBufferView[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
            hadChanges = noOfChanges > 0;
            for (let i = 0; i < noOfChanges; i++) {
                const index = this.changesBufferView[i];
                handleObject(i, index, this.objects[index]);
            }
            const noOfObjects = this.controlBufferView[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            if (noOfObjects < this.objects.length) {
                this.objects.length = noOfObjects;
            }
        }
        this.controlBufferView[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX] = 0;
        this.releaseLock();
        return hadChanges;
    }

    public getArray(): Array<T | undefined> {
        return this.objects;
    }

    public get(index: number): T | undefined {
        return this.objects[index];
    }
}
