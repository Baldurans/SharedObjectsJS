import {StateBuffer, StateBufferExport} from "./StateBuffer";

export interface StateBufferForMasterListeners<T> {
    updateObject: (index: number, obj: T | null) => T | null;
}

export class StateBufferForSlave<T> extends StateBuffer {

    private readonly listeners: StateBufferForMasterListeners<T>;
    private readonly objects: T[] = [];

    constructor(buffers: StateBufferExport, listeners: StateBufferForMasterListeners<T>) {
        super(buffers);
        this.listeners = listeners;
    }

    public init() {
        this.lock();
        const noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
        for (let i = 0; i < noOfObjects; i++) {
            this.objects[i] = this.listeners.updateObject(i, null);
        }
        this.releaseLock();
    }

    public populateObjectsAndGetChanges(): StateBufferForSlaveChanges<T> {
        const changes: StateBufferForSlaveChanges<T> = {
            deleted: [],
            updated: []
        }

        this.lock();
        const noOfChanges = this.controlBuffer[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
        for (let i = 0; i < noOfChanges; i++) {
            const index = this.changesBuffer[i];

            const existing = this.objects[index] || null;
            let updated: T = this.listeners.updateObject(index, existing) || null;
            if (updated) {
                changes.updated.push(updated);
            } else if (existing) {
                changes.deleted.push(existing);
            }

            this.objects[index] = updated;
            this.isDirtyBuffer[index] = 0;
            this.changesBuffer[i] = 0;
        }
        this.controlBuffer[StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX] = 0;

        this.releaseLock();

        return changes;
    }

    public getAllObjects(): Array<T | undefined> {
        return this.objects;
    }
}

export interface StateBufferForSlaveChanges<T> {
    deleted: T[];
    updated: T[];
}
