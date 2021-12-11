export abstract class StateBuffer {

    public readonly maxObjects: number;

    /**
     * [NO_OF_OBJECTS_INDEX, NO_OF_DIRTY_OBJECTS_INDEX, LOCK_INDEX]
     */
    protected readonly controlBufferView: Int32Array;
    /**
     * Registers all changes. Each value is index of object that changed.
     */
    protected readonly changesBufferView: Uint32Array;
    /**
     * Key is index for object that is dirty. Used for lookup if object is already marked dirty, so it would not be added to changeBuffer multiple times.
     */
    protected readonly isDirtyBufferView: Uint8Array;
    /**
     * Data of this state buffer. Views would be created be extending classes.
     */
    protected readonly dataBuffer: SharedArrayBuffer;

    protected readonly size8: number;
    protected readonly view8: Uint8Array;

    /**
     * Only set if objectSizeInBytes % 4 === 0
     */
    protected readonly size32: number | undefined;
    /**
     * Only set if objectSizeInBytes % 4 === 0
     */
    protected readonly view32: Uint32Array | undefined;

    private static CONTROL_BUFFER_LENGTH = 4;

    // control buffer keys
    public static NO_OF_OBJECTS_INDEX = 0;
    public static NO_OF_DIRTY_OBJECTS_INDEX = 1;
    private static LOCK_INDEX = 2;
    private static OBJECT_SIZE_INDEX = 3;

    private static UNLOCKED = 0;
    private static LOCKED = 1;

    public static CLEAN = 0;
    public static DIRTY = 1;

    protected constructor(buffers: StateBufferExport);
    protected constructor(maxObjects: number, objectSizeInBytes: number);
    protected constructor(buffersOrMaxObjects: number | StateBufferExport, objectSizeInBytes?: number) {
        if (typeof buffersOrMaxObjects === "number") {
            this.controlBufferView = new Int32Array(new SharedArrayBuffer(StateBuffer.CONTROL_BUFFER_LENGTH * Int32Array.BYTES_PER_ELEMENT))
            this.changesBufferView = new Uint32Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint32Array.BYTES_PER_ELEMENT))
            this.isDirtyBufferView = new Uint8Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint8Array.BYTES_PER_ELEMENT));
            this.dataBuffer = new SharedArrayBuffer(buffersOrMaxObjects * objectSizeInBytes);
            this.maxObjects = buffersOrMaxObjects;
            this.size8 = objectSizeInBytes;
            this.controlBufferView[StateBuffer.OBJECT_SIZE_INDEX] = this.size8;
        } else {
            this.controlBufferView = new Int32Array(buffersOrMaxObjects.controlBuffer)
            this.changesBufferView = new Uint32Array(buffersOrMaxObjects.changesBuffer)
            this.isDirtyBufferView = new Uint8Array(buffersOrMaxObjects.isDirtyBuffer)
            this.dataBuffer = buffersOrMaxObjects.dataBuffer
            this.size8 = this.controlBufferView[StateBuffer.OBJECT_SIZE_INDEX];
            this.maxObjects = Math.floor(buffersOrMaxObjects.changesBuffer.length / Uint32Array.BYTES_PER_ELEMENT);
        }
        this.view8 = new Uint8Array(this.dataBuffer);

        if (this.size8 % 4 === 0) {
            this.size32 = Math.floor(this.size8 * 0.25);
            this.view32 = new Uint32Array(this.dataBuffer);
        }
    }

    public lock(): void {
        while (true) {
            const oldValue = Atomics.compareExchange(this.controlBufferView, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
            if (oldValue === StateBuffer.UNLOCKED) {
                return;
            }
            Atomics.wait(this.controlBufferView, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED);
        }
    }

    public releaseLock() {
        const oldValue = Atomics.compareExchange(this.controlBufferView, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED, StateBuffer.UNLOCKED);
        if (oldValue != StateBuffer.LOCKED) {
            throw new Error('Tried to unlock while not holding the mutex');
        }
        Atomics.notify(this.controlBufferView, StateBuffer.LOCK_INDEX, 1);
    }

    public executeLocked(callback: () => void): void {
        const oldValue = Atomics.compareExchange(this.controlBufferView, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
        if (oldValue == StateBuffer.UNLOCKED) {
            callback();
            this.releaseLock();
            return;
        } else {
            setTimeout(() => {
                this.executeLocked(callback);
            }, 0);
        }
    }

    public export(): StateBufferExport {
        return {
            controlBuffer: this.controlBufferView.buffer as SharedArrayBuffer,
            changesBuffer: this.changesBufferView.buffer as SharedArrayBuffer,
            isDirtyBuffer: this.isDirtyBufferView.buffer as SharedArrayBuffer,
            dataBuffer: this.dataBuffer
        }
    }
}

export interface StateBufferExport {
    controlBuffer: SharedArrayBuffer;
    changesBuffer: SharedArrayBuffer;
    isDirtyBuffer: SharedArrayBuffer;
    dataBuffer: SharedArrayBuffer
}

