import {StateBufferExport} from "./StateBuffer";
import {StateBufferForSlave, StateBufferForSlaveChanges} from "./StateBufferForSlave";

export abstract class SharedObjectSlaveArray<T extends object> {

    private readonly stateBuffer: StateBufferForSlave<T>;

    protected constructor(buffers: StateBufferExport) {
        this.stateBuffer = new StateBufferForSlave(buffers, {
            updateObject: (index, obj) => {
                return this.updateObject(index, obj);
            }
        });
    }

    protected abstract updateObject(index: number, obj: T | null): T | null;

    public init(): this {
        this.stateBuffer.init();
        return this;
    }

    public sync(): StateBufferForSlaveChanges<T> {
        return this.stateBuffer.sync();
    }

    public getArray(): Array<T | undefined> {
        return this.stateBuffer.getArray();
    }

    public get(index: number): T | undefined {
        return this.stateBuffer.get(index);
    }
}
