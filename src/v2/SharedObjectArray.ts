export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export type TypesOfTypedArray = typeof Uint8Array | typeof Uint16Array | typeof Uint32Array | typeof Int8Array | typeof Int16Array | typeof Int32Array;

export type TypedArrayConstructor<A extends TypedArray> = { new(buffer: SharedArrayBuffer): A, BYTES_PER_ELEMENT: number };

export interface TypesStructure {
    [key: string]: TypesOfTypedArray;
}

interface TypedArrayDefinition {
    [key: string]: new (...args: any[]) => TypedArray;
}

type ConstructorToValues<T extends TypedArrayDefinition> = { [K in keyof T]: T[K] extends new (...args: any[]) => infer R ? R : never };


export class StateBuffer {

    private readonly array: Uint32Array;

    constructor() {
        this.array = new Uint32Array(new SharedArrayBuffer(3 * Uint32Array.BYTES_PER_ELEMENT))
    }

    public getLength(): number {
        return this.array[0]
    }

    public getChangeLock(): number {
        return this.array[1];
    }

    public getNoOfChanges(): number {
        return this.array[2];
    }

    public lock() {

    }

    public releaseLock() {

    }

}

export abstract class SharedObjectArray<D extends TypesStructure, T extends SharedObject<D>> {

    //private readonly STATE_NO_OF_VARIABLES = 3;

    //private readonly stateBuffer: StateBuffer;
    public readonly data: ConstructorToValues<D>;

    //private blankObjectFactory: () => T;

    protected constructor(objectSize: number, maxObjectsOrBuffer: number, types: D, blankObjectFactory: () => T) {

        const maxObjects: number = maxObjectsOrBuffer;

        for (const k in types) {
            const type = types[k];
            const objectSizeInBytes = objectSize * type.BYTES_PER_ELEMENT;
            this.data[k] = new type(new SharedArrayBuffer(maxObjects * objectSizeInBytes));
        }

        //this.stateBuffer = new StateBuffer();
        //this.data.__state = new Uint32Array(new SharedArrayBuffer(this.STATE_NO_OF_VARIABLES * Uint32Array.BYTES_PER_ELEMENT));
        //this.data.__exists = new Uint8Array(new SharedArrayBuffer(maxObjects * Uint8Array.BYTES_PER_ELEMENT));
        //this.data.__changes = new Uint32Array(new SharedArrayBuffer(maxObjects * Uint8Array.BYTES_PER_ELEMENT));
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

}

export class SlaveSharedObjectArray<D extends TypesStructure, T extends SharedObject<D>> {

    public forEach(callback: (item: T) => void): void {

    }

    public get(index: number): T | null {
        return null;
    }

    public getChanges(): Array<{ previous: T, current: T }> {
        return [];
    }

}


export class SharedObject<D extends TypesStructure> {

    private __dataStructure: SharedObjectArray<D, any>;
    private __index: number;

    protected __getValue(key: keyof D): number {
        this.__dataStructure.data.x.slice();
        return this.__dataStructure.data[key][this.__index];
    }

    protected __setValue(key: keyof D, value: number): void {
        this.__dataStructure.data[key][this.__index] = value;
    }
}


function getTypes() {
    return {
        type: Uint8Array,
        x: Uint8Array,
        y: Uint8Array
    };
}

export class MyArray extends SharedObjectArray<ReturnType<typeof getTypes>, MyObject> {

    constructor(buffer: SharedArrayBuffer[]) {
        super(3, 10000, getTypes(), () => new MyObject());
    }

}

export class MyObject extends SharedObject<ReturnType<typeof getTypes>> {

    public get x(): number {
        return this.__getValue("x");
    }

    public set x(value: number) {
        this.__setValue("x", value);
    }

}
