import {StateBufferForSlave, StateBufferForSlaveChanges} from "./StateBufferForSlave";
import {StateBufferExport} from "./StateBufferForMaster";

export abstract class SharedObjectArraySlave<T extends object> {

    private readonly stateBuffer: StateBufferForSlave<T>;

    protected constructor(buffers: StateBufferExport) {
        this.stateBuffer = new StateBufferForSlave(buffers, {
            updateObject: (index, obj) => {
                return this.updateObject(index, obj);
            }
        });
    }

    protected abstract updateObject(index: number, obj: T | undefined): T | undefined;

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
