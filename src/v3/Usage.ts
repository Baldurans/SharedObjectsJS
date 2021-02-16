import {SharedObject, SharedObjectArray} from "./V3";

function getTypeStructure() {
    return {
        type: Uint8Array,
        x: Uint8Array,
        y: Uint8Array
    };
}

export class MyArray extends SharedObjectArray<ReturnType<typeof getTypeStructure>, MyObject> {

    constructor(buffer: SharedArrayBuffer[]) {
        super(3, 10000, getTypeStructure(), () => new MyObject());
    }

}

export class MyObject extends SharedObject<ReturnType<typeof getTypeStructure>> {

    public get x(): number {
        return this.__getValue("x");
    }

    public set x(value: number) {
        this.__setValue("x", value);
    }

}
