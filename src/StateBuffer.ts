export abstract class StateBuffer {

    protected readonly controlBuffer: Int32Array;
    protected readonly changesBuffer: Uint32Array;
    protected readonly isDirtyBuffer: Uint8Array;

    private static CONTROL_BUFFER_LENGTH = 3;
    public static NO_OF_OBJECTS_INDEX = 0;
    public static NO_OF_DIRTY_OBJECTS_INDEX = 1;
    private static LOCK_INDEX = 2;

    private static UNLOCKED = 0;
    private static LOCKED = 1;

    protected constructor(buffersOrMaxObjects: number | StateBufferExport) {
        if (typeof buffersOrMaxObjects === "number") {
            this.controlBuffer = new Int32Array(new SharedArrayBuffer(StateBuffer.CONTROL_BUFFER_LENGTH * Uint32Array.BYTES_PER_ELEMENT))
            this.changesBuffer = new Uint32Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint32Array.BYTES_PER_ELEMENT))
            this.isDirtyBuffer = new Uint8Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint8Array.BYTES_PER_ELEMENT))
        } else {
            this.controlBuffer = new Int32Array(buffersOrMaxObjects.controlBuffer)
            this.changesBuffer = new Uint32Array(buffersOrMaxObjects.changesBuffer)
            this.isDirtyBuffer = new Uint8Array(buffersOrMaxObjects.isDirtyBuffer)
        }
    }

    public lock(): void {
        while (true) {
            const oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
            if (oldValue === StateBuffer.UNLOCKED) {
                return;
            }
            Atomics.wait(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED);
        }
    }

    public releaseLock() {
        const oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED, StateBuffer.UNLOCKED);
        if (oldValue != StateBuffer.LOCKED) {
            throw new Error('Tried to unlock while not holding the mutex');
        }
        Atomics.notify(this.controlBuffer, StateBuffer.LOCK_INDEX, 1);
    }

    public executeLocked(callback: () => void): void {
        const oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
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

}

export interface StateBufferExport {
    controlBuffer: SharedArrayBuffer;
    changesBuffer: SharedArrayBuffer;
    isDirtyBuffer: SharedArrayBuffer;
}
