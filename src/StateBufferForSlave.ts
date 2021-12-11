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

    protected abstract updateObject(index: number, obj: T | undefined): T | undefined;

    public sync(): StateBufferForSlaveChanges<T> {
        const changes: StateBufferForSlaveChanges<T> = {
            added: [],
            updated: [],
            deleted: []
        }

        const handleObject = (changeIndex: number, objIndex: number, obj: T | undefined) => {

            let updated: T = undefined;
            if (this.exists(objIndex)) {
                if (obj && this.isSame(objIndex, obj)) {
                    updated = this.updateObject(objIndex, obj);
                } else {
                    updated = this.updateObject(objIndex, {} as T);
                }
            }

            if (updated) {
                if (this.objectsSet.has(updated)) {
                    changes.updated.push(updated);
                } else {
                    this.objectsSet.add(updated);
                    changes.added.push(updated);
                }
            }

            if (obj && updated !== obj) {
                this.objectsSet.delete(obj);
                changes.deleted.push(obj);
            }

            this.objects[objIndex] = updated;
            this.isDirtyBufferView[objIndex] = StateBuffer.CLEAN;
            this.changesBufferView[changeIndex] = 0;
        }

        this.lock();

        if (this.isInitialized === false) {
            this.isInitialized = true;
            const noOfObjects = this.controlBufferView[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            for (let i = 0; i < noOfObjects; i++) {
                handleObject(i, i, undefined);
            }

        } else {
            const noOfChanges = this.controlBufferView[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
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
        return changes;
    }

    public getArray(): Array<T | undefined> {
        return this.objects;
    }

    public get(index: number): T | undefined {
        return this.objects[index];
    }
}

export interface StateBufferForSlaveChanges<T> {
    added: T[];
    updated: T[];
    deleted: T[];
}
