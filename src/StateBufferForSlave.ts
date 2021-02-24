import {StateBuffer} from "./StateBuffer";
import {StateBufferExport} from "./StateBufferForMaster";

export interface StateBufferForMasterListeners<T> {
    updateObject: (index: number, obj: T | undefined) => T | undefined;
}

export class StateBufferForSlave<T> extends StateBuffer {

    private readonly listeners: StateBufferForMasterListeners<T>;
    private readonly objects: T[] = [];
    private isInitialized = false;

    constructor(buffers: StateBufferExport, listeners: StateBufferForMasterListeners<T>) {
        super(buffers);
        this.listeners = listeners;
    }

    public init() {
        this.lock();
        this.isInitialized = false;
        const noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
        for (let i = 0; i < noOfObjects; i++) {
            this.objects[i] = this.listeners.updateObject(i, undefined);
        }
        this.releaseLock();
    }

    public sync(): StateBufferForSlaveChanges<T> {
        const changes: StateBufferForSlaveChanges<T> = {
            deleted: [],
            updated: []
        }

        this.lock();

        if (this.isInitialized === false) {
            changes.updated = this.objects;
            this.isInitialized = true;

        } else {
            const noOfChanges = this.controlBuffer[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];

            for (let i = 0; i < noOfChanges; i++) {
                const index = this.changesBuffer[i];

                const existing = this.objects[index] || undefined;
                let updated: T = this.listeners.updateObject(index, existing) || undefined;
                if (updated) {
                    changes.updated.push(updated);
                }

                if (existing && updated !== existing) {
                    changes.deleted.push(existing);
                }

                this.objects[index] = updated;
                this.isDirtyBuffer[index] = StateBuffer.CLEAN;
                this.changesBuffer[i] = 0;
            }
            this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX] = 0;
            const noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
            if (noOfObjects < this.objects.length) {
                this.objects.length = noOfObjects;
            }
        }

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
    deleted: T[];
    updated: T[];
}
