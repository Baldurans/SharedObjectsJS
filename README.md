# Share objects in WebWorkers using SharedArrayBuffer

This is a master-slave solution for sharing data between the main thread and a single worker.
Master updates data, slave consumes data and understands what changed.

Main use case is using it to sync fast changing data with worker thread in an efficient way. Main purpose for 
worker could be rendering offscreen canvas.

#### Where is it useful?
When:
* updating your Canvas on the main thread just won't do.
* you need to use OffscreenCanvas 
* you need to sync lots of data to webWorker to render its contents. (worker.postMessage is not an option)
* you want to abstract all memory synchronization issues and related out from your main application.
* you are ok with eventual consistency (for example game loop interval is different from visible frame rate)

#### Why?
* There is no other way to my knowledge to populate workers with big amount of data that changes often.
* It gives protection against shared memory issues in rather simple way. 
* All writes and reads happen in bulk while keeping the lock. 
* This way every minor updates to the data does not have to deal with locking.

#### Install
```
npm install shared-objects
```

#### General algorithm
MASTER
1) On your tick make your calculations and add dirty objects to MASTER
2) master.flushToMemory()
     - lock memory
     - update shared array buffers
     - unlock
3) back to beginning

SLAVE
1) const changes = slave.sync() for example called in requestAnimationFrame handler.
     - lock memory
     - update local objects
     - unlock
2) update OffscreenCanvas based on changes.
3) back to beginning

#### Anything else?
Complexity of change detection is O(no_of_objects_changed).

Its fast enough for ~30 fps with 100k objects that change every frame. 
(Depends on the CPU and million other things of course, but to just give you ball park figure.)

## Example of use case
```
// IN Main thread
const main = new ExampleMasterObjectArray(5);
main.initPeriodicFlush(60); // 60 is target FPS, uses setInterval
worker.postMessage({buffers: main.export()});

const obj1 = {x: 1, y: 2};
const obj2 = {x: 3, y: 4};

main.dirtyObject(obj1);
main.dirtyObject(obj2);
main.deleteObject(obj1);
main.replaceObjectAt(0, obj1);

// IN Worker thread
const slave = new ExampleSlaveObjectArray( buffersFromMain ).init();
const f = () => {
    const changes = slave.sync(); // Creates local dataset from shared memory. (while doing so memory is locked).
    console.log(changes.deleted);
    console.log(changes.updated);
    requestAnimationFrame(f);
}
f();
```

## Example of definition
```
export class ExampleMasterObjectArray extends SharedObjectArrayMaster<MasterObject> {

    private readonly main: Uint8Array;
    private readonly sec: Uint32Array;

    public constructor( maxObjects: number ) {
        super(maxObjects);
        this.main = new Uint8Array(new SharedArrayBuffer(maxObjects * 3 * Uint8Array.BYTES_PER_ELEMENT));
        this.sec = new Uint32Array(new SharedArrayBuffer(maxObjects * 2 * Uint32Array.BYTES_PER_ELEMENT));
    }

    protected populateMemory(index: number, obj: MasterObject) {
        const pos = index * 3;
        const pos2 = index * 2;
        this.main[pos] = obj.metaId;
        this.main[pos + 1] = obj.x;
        this.main[pos + 2] = obj.y;
        this.sec[pos2] = obj.sx;
        this.sec[pos2 + 1] = obj.sy;
    }

    protected deleteMemory(index: number) {
        const pos = index * 3;
        const pos2 = index * 2;
        this.main[pos] = 0;
        this.main[pos + 1] = 0;
        this.main[pos + 2] = 0;
        this.sec[pos2] = 0;
        this.sec[pos2 + 1] = 0;
    }

    public export(): ExampleBuffersExport {
        return {
            ...super.export(),
            main: this.main.buffer as SharedArrayBuffer,
            sec: this.sec.buffer as SharedArrayBuffer,
        }
    }
}

export interface MasterObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}

export class ExampleSlaveObjectArray extends SharedObjectArraySlave<SlaveObject> {

    private readonly main: Uint8Array;
    private readonly sec: Uint32Array;

    public constructor(buffers: ExampleBuffersExport) {
        super(buffers);
        this.main = new Uint8Array(buffers.main)
        this.sec = new Uint32Array(buffers.sec)
    }

    protected updateObject(index: number, obj: SlaveObject | undefined): SlaveObject | undefined {
        if (!obj) {
            obj = {} as any;
        }
        if (this.main[index * 3] === 0) {
            return undefined;
        }
        const pos = index * 3;
        const pos2 = index * 2;
        obj.metaId = this.main[pos];
        obj.x = this.main[pos + 1];
        obj.y = this.main[pos + 2];
        obj.sx = this.sec[pos2];
        obj.sy = this.sec[pos2 + 1];
        return obj;
    }
}

export interface SlaveObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}

export interface ExampleBuffersExport extends StateBufferExport {
    main: SharedArrayBuffer;
    sec: SharedArrayBuffer;
}
```

## Warnings
It uses SharedArrayBuffer and Atomics. Make sure your target browsers support those!

## License
MIT - Do what ever you want with it. If you found it useful, let me know :)
