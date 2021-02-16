export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export type TypedArrayConstructor = { new(buffer: SharedArrayBuffer): TypedArray, BYTES_PER_ELEMENT: number };

interface TypedArrayDefinition {
    [key: string]: TypedArrayConstructor;
}
type ConstructorToValues<T extends TypedArrayDefinition> = {[K in keyof T]: T[K] extends new (...args: any[]) => infer R ? R : never};

export abstract class SharedObjectArray<D extends TypedArrayDefinition, T extends SharedObject<D>> {

    //private readonly STATE_NO_OF_VARIABLES = 3;

    //private readonly stateBuffer: StateBuffer;
    public readonly data: ConstructorToValues<D>;

    //private blankObjectFactory: () => T;

    protected constructor(maxObjects: number, types: D, blankObjectFactory: () => T) {
        this.data = this.createInstances(types, maxObjects);

        (this.data["" as any] as TypedArray).slice();
        //this.stateBuffer = new StateBuffer();
        //this.data.__state = new Uint32Array(new SharedArrayBuffer(this.STATE_NO_OF_VARIABLES * Uint32Array.BYTES_PER_ELEMENT));
        //this.data.__exists = new Uint8Array(new SharedArrayBuffer(maxObjects * Uint8Array.BYTES_PER_ELEMENT));
        //this.data.__changes = new Uint32Array(new SharedArrayBuffer(maxObjects * Uint8Array.BYTES_PER_ELEMENT));
    }

    private createInstances(arg: D, maxObjects: number): ConstructorToValues<D> {
        const s: ConstructorToValues<D> = {} as any;
        for (const k in arg) {
            const type = arg[k];
            const objectSizeInBytes = maxObjects * type.BYTES_PER_ELEMENT;
            const res = new type(new SharedArrayBuffer(maxObjects * objectSizeInBytes));
            s[k] = res as any;
        }
        return s;
    };

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


export class SharedObject<D extends TypedArrayDefinition> {

    protected __dataStructure: SharedObjectArray<D, any>;
    private __data: ConstructorToValues<D>;
    private __index: number;

    protected __getValue(key: keyof D): number {
        const map = this.__dataStructure.data[key];
        return map[this.__index];
    }

    protected __setValue(key: keyof D, value: number): void {
        const map = this.__data[key];
        map[this.__index] = value;
    }
}

type xxx = () => TypedArrayDefinition;

function getTypeStructure() {
    return {
        type: Uint8Array,
        x: Uint8Array,
        y: Uint8Array
    };
}

const f: xxx = getTypeStructure;
String(f);

export class Example extends SharedObjectArray<ReturnType<typeof getTypeStructure>, any> {

    public something() {
        this.data.x
    }
}

export class ExampleObject extends SharedObject<ReturnType<typeof getTypeStructure>> {

    public something() {
        this.__dataStructure.data.x[5];
        this.__getValue("x");
    }

}
