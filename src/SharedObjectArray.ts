import {StateBufferForMaster} from "./StateBufferForMaster";
import {StateBufferExport} from "./StateBuffer";

export abstract class SharedObjectArray<T extends object> {

    private readonly stateBuffer: StateBufferForMaster<T>;

    protected constructor(maxObjects: number) {
        this.stateBuffer = new StateBufferForMaster(maxObjects, {
            populateMemory: (index, obj) => {
                this.populateMemory(index, obj)
            },
            deleteMemory: (index, obj) => {
                this.deleteMemory(index, obj)
            }
        });
    }

    protected abstract populateMemory(index: number, obj: T): void;

    protected abstract deleteMemory(index: number, obj: T): void;

    public replaceObjectAtIndex(index: number, object: T) {
        this.stateBuffer.replaceObjectAtIndex(index, object);
    }

    public flushToMemory() {
        this.stateBuffer.flushToMemory();
    }

    public addDirtyObject(obj: T) {
        this.stateBuffer.addDirtyObject(obj);
    }

    public addDeletedObject(obj: T) {
        this.stateBuffer.addDeletedObject(obj);
    }

    public export(): StateBufferExport {
        return this.stateBuffer.export();
    }
}
