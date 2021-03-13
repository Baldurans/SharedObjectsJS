import {StateBuffer} from "./StateBuffer";
import {StateBufferExport} from "./StateBufferForMaster";

export interface StateBufferForMasterListeners<T> {
    updateObject: (index: number, obj: T | undefined) => T | undefined;
}

export class StateBufferForSlave<T> extends StateBuffer {

    private readonly listeners: StateBufferForMasterListeners<T>;
    private readonly objects: T[] = [];
    private readonly objectsSet: Set<T> = new Set();
    private isInitialized = false;

    constructor(buffers: StateBufferExport, listeners: StateBufferForMasterListeners<T>) {
        super(buffers);
        this.listeners = listeners;
    }

    public sync(): StateBufferForSlaveChanges<T> {
        const changes: StateBufferForSlaveChanges<T> = {
            added: [],
            updated: [],
            deleted: []
        }

        const handleObject = (changeIndex: number, objIndex: number, existing: T) => {
            let updated: T = this.listeners.updateObject(objIndex, existing) || undefined;
            if (updated) {
                if (this.objectsSet.has(updated)) {
                    changes.updated.push(updated);
                } else {
                    this.objectsSet.add(updated);
                    changes.added.push(updated);
                }
            }

            if (existing && updated !== existing) {
                this.objectsSet.delete(existing);
                changes.deleted.push(existing);
            }

            this.objects[objIndex] = updated;
            this.isDirtyBuffer[objIndex] = StateBuffer.CLEAN;
            this.changesBuffer[changeIndex] = 0;
        }

        this.lock();

        if (this.isInitialized === false) {
            this.isInitialized = true;
            const noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            for (let i = 0; i < noOfObjects; i++) {
                handleObject(i, i, undefined);
            }

        } else {
            const noOfChanges = this.controlBuffer[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
            for (let i = 0; i < noOfChanges; i++) {
                const index = this.changesBuffer[i];
                handleObject(i, index, this.objects[index] || undefined);
            }

            const noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            if (noOfObjects < this.objects.length) {
                this.objects.length = noOfObjects;
            }
        }

        this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX] = 0;
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
