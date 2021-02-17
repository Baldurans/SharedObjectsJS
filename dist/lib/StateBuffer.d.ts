import { StateBufferExport } from "./StateBufferForMaster";
export declare abstract class StateBuffer {
    /**
     * [NO_OF_OBJECTS_INDEX, NO_OF_DIRTY_OBJECTS_INDEX, LOCK_INDEX]
     */
    protected readonly controlBuffer: Int32Array;
    /**
     * Registers all changes. Each value is index of object that changed.
     */
    protected readonly changesBuffer: Uint32Array;
    /**
     * Key is index for object that is dirty. Used for lookup if object is already marked dirty, so it would not be added to changeBuffer multiple times.
     */
    protected readonly isDirtyBuffer: Uint8Array;
    private static CONTROL_BUFFER_LENGTH;
    static NO_OF_OBJECTS_INDEX: number;
    static NO_OF_DIRTY_OBJECTS_INDEX: number;
    private static LOCK_INDEX;
    private static UNLOCKED;
    private static LOCKED;
    static CLEAN: number;
    static DIRTY: number;
    protected constructor(buffersOrMaxObjects: number | StateBufferExport);
    lock(): void;
    releaseLock(): void;
    executeLocked(callback: () => void): void;
}
