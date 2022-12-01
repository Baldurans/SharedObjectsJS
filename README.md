# Share objects in WebWorkers using SharedArrayBuffer

This is a master-slave solution for sharing data between the main thread and a single worker. Master updates data, slave consumes data and understands what changed.

Main use case is using it to sync fast changing data with worker thread in an efficient way. Main purpose for worker could be rendering offscreen canvas.

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

Its fast enough for ~50 fps with 100k objects that change every tick/frame.
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
export class ExampleMasterObjectArray extends StateBufferForMaster<MasterObject> {

    public constructor(maxObjects: number) {
        super(maxObjects, 12);
    }

    protected populateMemory(index: number, obj: MasterObject) {
        const p8 = index * this.size8;
        const p32 = index * this.size32;
        this.view8[p8] = obj.metaId;
        this.view8[p8 + 1] = obj.x;
        this.view8[p8 + 2] = obj.y;
        this.view32[p32 + 1] = obj.sx;
        this.view32[p32 + 2] = obj.sy;
    }

}

export interface MasterObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}

export class ExampleSlaveObjectArray extends StateBufferForSlave<SlaveObject> {

    protected exists(index: number) {
        return this.view8[index * this.size8] !== 0;
    }

    protected isSame(index: number, obj: SlaveObject) {
        return obj.metaId === this.view8[index * this.size8];
    }

    protected onNew(index: number): SlaveObject {
        const p8 = index * this.size8;
        const p32 = index * this.size32;
        return {
            metaId: this.view8[p8],
            x: this.view8[p8 + 1],
            y: this.view8[p8 + 2],
            sx: this.view32[p32 + 1],
            sy: this.view32[p32 + 2]
        }
    }
    
    protected onUpdate(index: number, obj: SlaveObject): void {
        const p8 = index * this.size8;
        const p32 = index * this.size32;
        obj.x = this.view8[p8 + 1];
        obj.y = this.view8[p8 + 2];
        obj.sx = this.view32[p32 + 1];
        obj.sy = this.view32[p32 + 2];
    }
    
    protected onDelete(index: number, obj: SlaveObject): void {
    }
}

export interface SlaveObject {
    metaId: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
}
```

## Warnings

It uses SharedArrayBuffer and Atomics. Make sure your target browsers support those!

## License

MIT - Do what ever you want with it. If you found it useful, let me know :)
