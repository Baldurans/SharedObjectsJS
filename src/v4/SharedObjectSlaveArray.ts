import {StateBuffer} from "./StateBuffer";
import {SharedArrayBuffersExport, TypedArrayDefinition, TypedArrayDefinitionExport} from "./SharedObjectArray";
import {SlaveObject} from "./USAGE";

export type SlaveStructure<D extends TypedArrayDefinition> = {
    [K in keyof D]: number
}

export abstract class SharedObjectSlaveArray<D extends TypedArrayDefinition, T extends SlaveStructure<D>> {

    private readonly stateBuffer: StateBuffer;
    private readonly changesBuffer: Uint32Array;
    private readonly sharedData: D;
    private readonly keys: Array<keyof D> = [];
    private readonly primaryKey: keyof D;

    private localObjects: T[] = [];

    protected constructor(buffers: TypedArrayDefinitionExport, structure: (buffers: SharedArrayBuffersExport) => D, primaryKey: keyof D) {
        this.sharedData = structure(buffers);
        this.stateBuffer = new StateBuffer(buffers.__state);
        this.primaryKey = primaryKey;

        this.changesBuffer = new Uint32Array(buffers.__changes);
        for (const k in this.sharedData) {
            this.keys.push(k);
        }

        this.createInitialLocalObjects();
    }

    private createInitialLocalObjects() {
        this.stateBuffer.lock();

        const noOfObjects = this.stateBuffer.getCurrentNoOfObjects();
        for (let i = 0; i < noOfObjects; i++) {
            this.localObjects[i] = {} as any;
        }

        for (const k in this.sharedData) {
            const sharedArray = this.sharedData[k];
            for (let i = 0; i < noOfObjects; i++) {
                (this.localObjects[i] as any)[k] = sharedArray[i];
            }
        }

        for (let i = 0; i < noOfObjects; i++) {
            Object.freeze(this.localObjects[i]);
        }

        this.stateBuffer.releaseLock();
    }

    public getChanges(): SharedObjectChange<T>[] {
        this.stateBuffer.lock();

        const result: SharedObjectChange<T>[] = [];
        const noOfChanges = this.stateBuffer.getNoOfChanges();
        for (let i = 0; i < noOfChanges; i++) {
            const index = this.changesBuffer[i];

            let newObj: any = null;
            if (this.sharedData[this.primaryKey][index] !== 0) {
                newObj = {};
                for (let k = 0; k < this.keys.length; k++) {
                    const key = this.keys[k];
                    newObj[key] = this.sharedData[key][index];
                }
                this.populateObject(newObj);
                Object.freeze(newObj);
            }

            result.push({
                old: this.localObjects[index],
                new: newObj
            });
            this.localObjects[index] = newObj;
            this.changesBuffer[i] = 0;
        }
        this.stateBuffer.resetNoOfChanges();
        this.stateBuffer.releaseLock();
        return result;
    }

    protected populateObject(obj: SlaveObject) {

    }

    public get(index: number): T | null {
        return this.localObjects[index];
    }

}

export interface SharedObjectChange<T> {
    old: T | null;
    new: T | null;
}
