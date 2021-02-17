
import {ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";

const MAX = 100000;
const UPDATE = MAX / 2;
const initialObjects: MasterObject[] = [];
for (let i = 0; i < MAX; i++) {
    initialObjects.push({
        metaId: Math.round(Math.random() * 250) + 1,
        x: Math.round(Math.random() * 250),
        y: Math.round(Math.random() * 250),
        sx: Math.round(Math.random() * 30000),
        sy: Math.round(Math.random() * 30000)
    })
}

console.log("Testing with " + MAX + " objects");
const start = performance.now();
const main = new ExampleMasterObjectArray(MAX);
for (let i = 0; i < initialObjects.length; i++) {
    main.dirtyObject(initialObjects[i]);
}
console.log("A1: " + (performance.now() - start) + " (populate main)");

const start2 = performance.now();
main.flushToMemorySync();
console.log("A2: " + (performance.now() - start2) + " (sync to memory)");

const start3 = performance.now();
const slave = new ExampleSlaveObjectArray(main.export()).init();
console.log("A3: " + (performance.now() - start3) + " (start slave)");

const start4 = performance.now();
slave.sync();
console.log("A4: " + (performance.now() - start4) + " (populate slave)");

const start5 = performance.now();
main.flushToMemorySync();
console.log("A5: " + (performance.now() - start5) + " (empty flush from main)");

const start6 = performance.now();
slave.sync();
console.log("A6: " + (performance.now() - start6) + " (empty read from slave)");

const start7 = performance.now();
slave.sync();
console.log("A7: " + (performance.now() - start7) + " (empty read from slave)");

const start8 = performance.now();
const objects = main.getArray();
for (let i = 0; i < UPDATE; i++) {
    objects[i].x = 10;
    main.dirtyObject(objects[i]);
}
for (let i = UPDATE; i < UPDATE + UPDATE; i++) {
    main.deleteObject(objects[i]);
}
console.log("A8: " + (performance.now() - start8) + " (update elements, delete elements)");

const start9 = performance.now();
main.flushToMemorySync();
console.log("A9: " + (performance.now() - start9) + " (sync to memory)");

const start10 = performance.now();
const res = slave.sync();
console.log("A10: " + (performance.now() - start10) + " (read from slave - updated: " + res.updated.length + " deleted: " + res.deleted.length + ")");

const start11 = performance.now();
const res2 = slave.sync();
console.log("A11: " + (performance.now() - start11) + " (read from slave - updated: " + res2.updated.length + " deleted: " + res2.deleted.length + ")");
