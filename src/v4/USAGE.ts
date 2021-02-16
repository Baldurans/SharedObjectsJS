import {SharedObjectArray, TypedArrayDefinitionExport} from "./SharedObjectArray";
import {SharedObjectSlaveArray, SlaveStructure} from "./SharedObjectSlaveArray";

function getDataStructure(maxObjectsOrBuffers: number | { [key: string]: SharedArrayBuffer }) {
    if (typeof maxObjectsOrBuffers === "number") {
        return {
            type: new Uint8Array(new SharedArrayBuffer(maxObjectsOrBuffers * Uint8Array.BYTES_PER_ELEMENT)),
            x: new Uint8Array(new SharedArrayBuffer(maxObjectsOrBuffers * Uint8Array.BYTES_PER_ELEMENT)),
            y: new Uint8Array(new SharedArrayBuffer(maxObjectsOrBuffers * Uint8Array.BYTES_PER_ELEMENT))
        }
    } else {
        return {
            type: new Uint8Array(maxObjectsOrBuffers.type),
            x: new Uint8Array(maxObjectsOrBuffers.x),
            y: new Uint8Array(maxObjectsOrBuffers.y)
        }
    }
}

function createObject() {
    return new ExampleObject();
}

export class Example extends SharedObjectArray<ReturnType<typeof getDataStructure>, ExampleObject> {

    constructor() {
        super(10, getDataStructure, () => {
            return new ExampleObject();
        });
    }

    public something() {
        this.data.x
    }

}

export class ExampleObject extends SharedObject<ReturnType<typeof getDataStructure>> {

    public something() {
        this.__dataStructure.data.x[5];
        this.__getValue("x");
    }

}

export interface SlaveObject {
    id: number;
    type: number
    x: number
    y: number
}

export class MySlave extends SharedObjectSlaveArray<ReturnType<typeof getDataStructure>, SlaveObject> {

    constructor(buffers: TypedArrayDefinitionExport) {
        super(buffers, getDataStructure, "type");
    }

    protected populateObject(obj: SlaveObject) {
        obj.id = obj.x * obj.y;
    }

}
