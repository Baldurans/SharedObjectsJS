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
        this.lock();
        let hadChanges;
        if (this.isInitialized === false) {
            this.isInitialized = true;
            hadChanges = true;
            const noOfObjects = this.controlBufferView[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            for (let objIndex = 0; objIndex < noOfObjects; objIndex++) {
                const newObj = this.onNew(objIndex);
                this.objects[objIndex] = newObj;
                this.objectsSet.add(newObj);
                this.onUpdate(objIndex, newObj);

                this.isDirtyBufferView[objIndex] = StateBuffer.CLEAN;
                this.changesBufferView[objIndex] = 0;
            }
        } else {
            const noOfChanges = this.controlBufferView[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
            hadChanges = noOfChanges > 0;
            for (let changeIndex = 0; changeIndex < noOfChanges; changeIndex++) {
                const objIndex = this.changesBufferView[changeIndex];
                const obj = this.objects[objIndex];
                if (obj) {
                    const exists = this.exists(objIndex);
                    if (!exists || exists && !this.isSame(objIndex, obj)) {
                        this.onDelete(objIndex, obj);
                        this.objects[objIndex] = undefined;
                        this.objectsSet.delete(obj);
                    }
                }
            }
            for (let changeIndex = 0; changeIndex < noOfChanges; changeIndex++) {
                const objIndex = this.changesBufferView[changeIndex];
                if (this.exists(objIndex)) {
                    let obj = this.objects[objIndex];
                    if (!obj) {
                        obj = this.onNew(objIndex)
                        this.objects[objIndex] = obj;
                        this.objectsSet.add(obj);
                    }
                    this.onUpdate(objIndex, obj);
                }

                this.isDirtyBufferView[objIndex] = StateBuffer.CLEAN;
                this.changesBufferView[changeIndex] = 0;
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
