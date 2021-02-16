import {TypedArrayDefinition} from "./SharedObjectArray";

export class SharedObject<D extends TypedArrayDefinition> {

    private __data: D;
    private __index: number;

    public __setMemory(data: D, index: number) {
        this.__data = data;
        this.__index = index;
    }

    public __getIndex(): number | null {
        return this.__index;
    }

    protected __getValue(key: keyof D): number {
        return this.__data[key][this.__index];
    }

    protected __setValue(key: keyof D, value: number): void {
        this.__data[key][this.__index] = value;
    }
}
