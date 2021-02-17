import { StateBufferForSlaveChanges } from "./StateBufferForSlave";
import { StateBufferExport } from "./StateBufferForMaster";
export declare abstract class SharedObjectSlaveArray<T extends object> {
    private readonly stateBuffer;
    protected constructor(buffers: StateBufferExport);
    protected abstract updateObject(index: number, obj: T | null): T | null;
    init(): this;
    sync(): StateBufferForSlaveChanges<T>;
    getArray(): Array<T | undefined>;
    get(index: number): T | undefined;
}
