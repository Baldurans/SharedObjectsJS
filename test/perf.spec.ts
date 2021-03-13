import {ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";


test("perf", () => {

    const str: string[] = [];
    const timer = () => {
        const start = performance.now();
        return (msg: string) => {
            str.push((Math.round(((performance.now() - start) * 1000)) / 1000) + "ms - " + msg + " ");
            return timer();
        }
    }

    let perf = timer();

    const MAX = 100000;
    const UPDATE = MAX / 2;
    const initialObjects: MasterObject[] = [];
    for (let i = 0; i < MAX; i++) {
        initialObjects.push({
            metaId: 1,
            x: 2,
            y: 3,
            sx: 4,
            sy: 5
        })
    }
    perf = perf("create " + MAX + " objects");


    const main = new ExampleMasterObjectArray(MAX);
    for (let i = 0; i < initialObjects.length; i++) {
        main.dirtyObject(initialObjects[i]);
    }
    perf = perf("populate main");

    main.flushToMemorySync();
    perf = perf("sync to memory");

    const slave = new ExampleSlaveObjectArray(main.export());
    perf = perf("start slave");

    slave.sync();
    perf = perf("populate slave");

    main.flushToMemorySync();
    perf = perf("empty flush from main");

    slave.sync();
    perf = perf("empty read from slave");

    slave.sync();
    perf = perf("empty read from slave");

    const objects = main.getArray();
    for (let i = 0; i < UPDATE; i++) {
        objects[i].x = 10;
        main.dirtyObject(objects[i]);
    }
    for (let i = UPDATE; i < UPDATE + UPDATE; i++) {
        main.deleteObject(objects[i]);
    }
    perf = perf("update " + UPDATE + " elements, delete " + UPDATE + " elements");

    main.flushToMemorySync();
    perf = perf("sync to memory");

    const res = slave.sync();
    perf = perf("read from slave - updated: " + res.updated.length + " deleted: " + res.deleted.length + "");

    const res2 = slave.sync();
    perf("read from slave - updated: " + res2.updated.length + " deleted: " + res2.deleted.length + "");

    console.log(str);
});
