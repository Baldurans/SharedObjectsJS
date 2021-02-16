# Share objects in WebWorkers using SharedArrayBuffer

This is rather compact/small specific purpose master-slave solution. (MAX 1 slave)
Master updates data, slave consumes data and understands what changed.
Slave is eventually consistent.
Delay on slave depends on how often you call master.flushToMemory() and slave.populateObjects()

#### Where is it useful?
When:
* updating your Canvas on the main thread just won't do.
* you need to use OffscreenCanvas 
* you need to sync lots of data to webWorker to render its contents. (worker.postMessage is not an option!)
* you want to abstract all memory sync and related out from your main application.

#### Why?
* There is no other way to my knowledge to populate workers with big amount of data that changes very fast.
* It gives protection against shared memory issues in rather simple way. 
* All writes and reads happen in bulk while keeping the lock. 
* This way every minor updates to the data does not have to deal with locking.

#### General algoritm
MASTER
1) On your tick make your calculations and add dirty objects to MASTER
2) MASTER.flushToMemory()
3) back to beginning

SLAVE
1) requestAnimationFrame calls 'const changes = slave.sync()' - loads and detects changes in shared memory.
2) update OffscreenCanvas based on changes.
3) back to beginning

#### Anything else?
Complexity of change detection is O(no_of_objects_changed).

Its fast enough for ~30 fps with 100k objects that change every frame. 
(Depends on the CPU and million other things of course, but to just give you ball park figure.)

## Example
```
// IN Main thread
const main = new ExampleMasterObjectArray(5);
worker.postMessage({buffers: main.export()});

const obj1 = {x: 1, y: 2};
const obj2 = {x: 3, y: 4};

main.addDirtyObject(obj1);
main.addDirtyObject(obj2);
main.addDeletedObject(obj1);
main.replaceObjectAtIndex(0, obj1);
main.flushToMemory(); // Flushes contents to shared memory (while doing so memory is locked)


// IN Worker thread
const slave = new ExampleSlaveObjectArray( buffersFromMain ).init();
const changes = slave.sync(); // Creates local dataset from shared memory. (while doing so memory is locked).
console.log(changes.deleted);
console.log(changes.updated);

```

## Example
For actual code example check src/test/Example.ts
That file contains code that developer would need to write to set it up.

## Warnings
It uses SharedArrayBuffer and Atomics. Make sure your target browsers support those!

## Tests
I was too lazy to do it properly, worked for my case :)

## CONCLUSION
Do what ever you want with it. If you found it useful, let me know :)
