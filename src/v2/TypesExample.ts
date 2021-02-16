export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export type TypedArrayConstructor<A extends TypedArray> = { new(buffer: SharedArrayBuffer): A, BYTES_PER_ELEMENT: number };

export type TypesStructure<D extends { [key: string]: TypedArray }> = {
    [P in keyof D]: TypedArrayConstructor<D[P]>;
}

const s = createInstances({
    kkk: Uint8Array
});
s.kkk.slice();

const s2 = createInstances(getTypes());
s2.x.slice();


export type Row<T> = Record<string, T>;

// ----------------------------
// Problem definition

function getTypes() {
    return {
        type: Uint8Array,
        x: Uint8Array,
        y: Uint8Array
    };
}

interface TypedArrayDefinition {
    [key: string]: new (...args: any[]) => TypedArray;
}
type ConstructorToValues<T extends TypedArrayDefinition> = {[K in keyof T]: T[K] extends new (...args: any[]) => infer R ? R : never};


function createInstances<T extends TypedArrayDefinition>(arg: T): ConstructorToValues<T> {
    const s: ConstructorToValues<T> = {} as any;
    for (const k in arg) {
        const type = arg[k];
        s[k] = new type(null) as any;
    }
    return s;
}

const value = createInstances(getTypes());
String(value.type);


// ----------------------------
// Problem definition

function getTypes2() {
    return {
        type: Uint8Array,
        x: Uint8Array,
        y: Uint8Array
    };
}

interface TypedArrayDefinition2 {
    [key: string]: new (...args: any[]) => TypedArray;
}
type ConstructorToValues2<T extends TypedArrayDefinition2> = {[K in keyof T]: T[K] extends new (...args: any[]) => infer R ? R : never};

function createInstances2<T extends { [key: string]: TypedArray }>(arg: TypesStructure<T>): T {
    const s: T = {} as any;
    for (const k in arg) {
        const type = arg[k];
        s[k] = new type(null);
    }
    return s;
}

const value2: ConstructorToValues2<ReturnType<typeof getTypes2>> = createInstances2(getTypes2());
String(value2.type);
