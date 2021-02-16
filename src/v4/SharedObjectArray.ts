import {StateBuffer} from "./StateBuffer";
import {ChangesBuffer} from "./ChangesBuffer";
import {SharedObject} from "./SharedObject";

export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export interface TypedArrayDefinition {
    [key: string]: TypedArray;
}

export interface SharedArrayBuffersExport {
    [key: string]: SharedArrayBuffer
}

export interface TypedArrayDefinitionExport extends SharedArrayBuffersExport {
    __state: SharedArrayBuffer;
    __changes: SharedArrayBuffer;
}

export abstract class SharedObjectArray<D extends TypedArrayDefinition, T> {

    private readonly stateBuffer: StateBuffer;
    private readonly changesBuffer: ChangesBuffer;
    private readonly data: D;
    private readonly blankObjectFactory: () => T;
    private readonly keys: Array<keyof D> = [];

    protected constructor(maxObjects: number, structure: (maxObjects: number) => D, blankObjectFactory: () => T) {
        this.data = structure(maxObjects);
        this.stateBuffer = new StateBuffer();
        this.changesBuffer = new ChangesBuffer(maxObjects);
        this.blankObjectFactory = blankObjectFactory;

    }



    public syncState( obj: T) {

    }

    public forEach(callback: (item: T) => void): void {

    }

    public getNew(): T {
        return null;
    }

    public getNewAt(index: number): T {
        return null;
    }

    public get(index: number): T | null {
        return null;
    }

    public delete(index: number): void {

    }

    public clone(index: number): SharedObject<D> {
        return null;
    }

    public export(): TypedArrayDefinitionExport {
        const res: TypedArrayDefinitionExport = {
            __changes: this.changesBuffer.export(),
            __state: this.stateBuffer.export()
        }
        for (const k in this.data) {
            res[k] = this.data[k].buffer as SharedArrayBuffer;
        }
        return res;
    }

}

