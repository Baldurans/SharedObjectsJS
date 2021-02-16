type DataType = Uint32Array & { buffer: SharedArrayBuffer };

export class StateBuffer {

    private readonly data: DataType;

    constructor(buffer?: SharedArrayBuffer) {
        if (!buffer) {
            this.data = new Uint32Array(new SharedArrayBuffer(3 * Uint32Array.BYTES_PER_ELEMENT)) as DataType
        } else {
            this.data = new Uint32Array(buffer) as DataType;
        }
    }

    public getCurrentNoOfObjects(): number {
        return this.data[0]
    }

    public getNoOfChanges(): number {
        return this.data[2];
    }

    public resetNoOfChanges(): void {
        this.data[2] = 0;
    }

    public lock() {
        // @TODO
    }

    public releaseLock() {
        // @TODO
    }

    public waitForNoLock() {

    }

    public export(): SharedArrayBuffer {
        return this.data.buffer;
    }

}
