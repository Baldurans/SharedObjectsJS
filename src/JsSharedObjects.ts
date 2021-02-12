export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export type TypedArrayConstructor<A extends TypedArray> = { new(buffer: SharedArrayBuffer): A, BYTES_PER_ELEMENT: number };

export abstract class SharedObjectArray<A extends TypedArray, T extends MemoryObject<A, any>> {

    private RESERVED_VALUES = 1;

    private readonly maxObjects: number;
    private readonly objectSize: number;

    private readonly buffer: SharedArrayBuffer;

    private readonly data: A;
    private readonly objects: Map<number, T> = new Map();
    private readonly unusedIndexes: number[] = [];

    protected constructor(maxObjects: number, objectSize: number, buffer?: SharedArrayBuffer) {
        this.objectSize = objectSize;
        this.maxObjects = maxObjects;
        const typedArrayConstructor = this.getTypedArray();
        if (buffer) {
            this.buffer = buffer;
        } else {
            this.buffer = new SharedArrayBuffer(this.objectSize * this.maxObjects * typedArrayConstructor.BYTES_PER_ELEMENT + this.RESERVED_VALUES * typedArrayConstructor.BYTES_PER_ELEMENT);
        }
        this.data = new typedArrayConstructor(this.buffer);
    }

    protected abstract createBlankObject(): T;

    protected abstract getTypedArray(): TypedArrayConstructor<A>;

    public getBuffer(): SharedArrayBuffer {
        return this.buffer;
    }

    public get length() {
        return this.data[0];
    }

    /**
     * Loops over all existing objects and skips "empty slots".
     *
     * Where performance matters - If you maintain your objects well, it is slightly faster to loop with this:
     * for( let i=0, const l=arr.length; i<l; i++) {
     *     const item = arr.get(i);
     *     if( !item ) continue;
     * }
     */
    public forEach(callback: (obj: T, index: number) => void) {
        for (let i = 0; i < this.length; i++) {
            const obj = this.get(i);
            if (obj) {
                callback(obj, i);
            }
        }
    }

    /**
     * Sets object to specific position. Same as myArray[10] = obj
     * Throws if:
     *  - maximum objects reached (out of memory)
     *  - object already added
     *  - that position already has object
     *
     *  ~O(1)
     */
    public set(index: number, obj: T): T {
        if (obj.__getIndex()) {
            throw new Error("Object already added to memory!");
        }

        if (index >= this.maxObjects) {
            throw new Error("Maximum objects reached " + this.length + "/" + this.maxObjects);
        }

        if (this.data[this.getDataPos(index)]) {
            throw new Error("Index " + index + " already has object! Remove it first yourself :)")
        }

        if (this.data[0] <= index) {
            this.data[0] = index + 1;
        }
        return this.registerObject(index, obj);
    }

    /**
     * Kind of same as: myArray.push(obj)
     * BUT, it will reuse slots that were deleted.
     *
     * arr.push(1);
     * arr.push(2);
     * arr[0] = null;
     * arr.push(3)
     * Results in [null,2,3]
     *
     * But same calls here would result in
     * [3,2]
     *
     * Throws if:
     *  - object already added
     *  - maximum objects reached (out of memory)
     *
     *  ~O(1)
     */
    public add(obj: T): T {
        if (obj.__getIndex()) {
            throw new Error("Object already added to memory!");
        }

        let index: number;
        if (this.unusedIndexes.length > 0) {
            index = this.unusedIndexes.pop();

        } else {
            if (this.length === this.maxObjects) {
                throw new Error("Maximum objects reached " + this.length + "/" + this.maxObjects);
            }
            index = this.length;
            this.data[0]++;
        }
        return this.registerObject(index, obj);
    }

    /**
     * Kind of same as: const s = myArray[10]
     * ~O(1)
     */
    public get(index: number): T | null {
        if (this.data[this.getDataPos(index)]) {
            if (this.objects.has(index)) {
                return this.objects.get(index);
            } else {
                return this.registerObject(index, this.createBlankObject());
            }
        } else if (this.objects.has(index)) {
            this.objects.delete(index);
        }
        return null;
    }

    private getDataPos(index: number): number {
        return index * this.objectSize + this.RESERVED_VALUES;
    }

    private registerObject(index: number, obj: T): T {
        obj.__setMemory(this, this.data, index, this.getDataPos(index), true);
        this.objects.set(index, obj);
        return obj;
    }

    /**
     * Kind of same as: myList[10] = null;
     * ~O(1)
     */
    public delete(obj: T): void {
        const index = obj.__getIndex();

        if (this.objects.has(index)) {
            this.unusedIndexes.push(index);
            this.objects.delete(index);
            const dataPos = this.getDataPos(index);
            for (let i = 0; i < this.objectSize; i++) {
                this.data[dataPos + i] = 0;
            }
            obj.delete();
        }
    }

    /**
     * Fills up all empty positions by moving data to left
     * Complexity: O(n)
     */
    public optimize(): void {
        let moveToIndex = 0;
        for (let i = 0; i < this.length; i++) {
            const iPos = this.getDataPos(i);
            if (this.data[iPos] === 0) {
                continue;
            }
            this.moveObjectToNewIndex(i, moveToIndex);
            moveToIndex++;
        }
        this.data[0] = moveToIndex;
    }

    private moveObjectToNewIndex(currentIndex: number, newIndex: number) {
        if (currentIndex === newIndex) {
            return;
        }
        const obj = this.get(currentIndex);

        const newDataPos = this.getDataPos(newIndex);
        const oldDataPos = this.getDataPos(currentIndex);
        for (let i = 0; i < this.objectSize; i++) {
            this.data[newDataPos + i] = this.data[oldDataPos + i];
            this.data[oldDataPos + i] = 0;
        }

        this.objects.delete(newIndex);
        this.objects.set(currentIndex, obj);

        obj.__setMemory(this, this.data, currentIndex, newDataPos, false);
    }

    public toString() {
        let str: string[] = [];
        this.forEach((obj) => {
            str.push(String(obj));
        })
        return "(" + this.length + ") [" + str.join(",") + "]";
    }

}

export abstract class MemoryObject<A extends TypedArray, T extends SharedObjectArray<A, any>> {

    private readonly __init: () => void;
    private __memory: T;
    private __data: A;
    private __index: number;
    private __dataPos: number;

    constructor(init: () => void) {
        this.__init = init;
    }

    public __setMemory(memory: T, data: A, index: number, dataPos: number, init: boolean) {
        this.__memory = memory;
        this.__data = data;
        this.__index = index;
        this.__dataPos = dataPos;
        if (init) {
            this.__init();
        }
    }

    public __getIndex(): number | null {
        return this.__index;
    }

    public delete(): void {
        if (this.__dataPos !== null) {
            this.__dataPos = null;
            this.__data = null;
            this.__memory.delete(this);
            this.__memory = null;
            this.__index = null;
        }
    }

    protected __getValueAt(offset: number) {
        return this.__data[this.__dataPos + offset]
    }

    protected __setValueAt(offset: number, value: number) {
        this.__data[this.__dataPos + offset] = value
    }
}


