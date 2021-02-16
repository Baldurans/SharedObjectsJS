import {ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";

function toStr(obj: any) {
    let str: string [] = [];
    for (const k in obj) {
        str.push(k + "=" + obj[k]);
    }
    return "{" + str.join(", ") + "}";
}

function compare(msg: string, a: any, b: any) {
    const astr = toStr(a);
    const bstr = toStr(b);
    if (astr === bstr) {
        console.log(msg + ") " + astr + " === " + bstr);
    } else {
        console.error(new Error(msg + ") " + astr + " === " + bstr));
    }
}

function expectThrow(func: () => void) {
    try {
        func();
        console.error(new Error("Expected to throw!"));
    } catch (e) {
        console.log("Nice, threw Exception!");
    }
}

export class SyncTest {

    public static test() {

        const obj1: MasterObject = {metaId: 1, x: 2, y: 3, sx: 12345, sy: 54321};
        const obj2: MasterObject = {metaId: 2, x: 4, y: 5, sx: 11111, sy: 22222};
        const obj3: MasterObject = {metaId: 3, x: 6, y: 7, sx: 3333, sy: 4444};
        const obj4: MasterObject = {metaId: 4, x: 8, y: 9, sx: 3333, sy: 4444};
        const obj5: MasterObject = {metaId: 5, x: 8, y: 9, sx: 3333, sy: 4444};

        const main = new ExampleMasterObjectArray(5);
        const slave = new ExampleSlaveObjectArray(main.export()).init();

        function sync() {
            main.flushToMemorySync();
            slave.populateObjects();
        }

        function compareState(objects: any[], match: any[]) {
            compare("0", objects[0], match[0]);
            compare("1", objects[1], match[1]);
            compare("2", objects[2], match[2]);
            compare("3", objects[3], match[3]);
            compare("4", objects[4], match[4]);
        }

        main.addDirtyObject(obj1);
        main.addDirtyObject(obj2);

        compareState(main.getArray(), [null, null, null, null, null]);
        sync();
        compareState(main.getArray(), [obj1, obj2, null, null, null]);
        compareState(slave.getArray(), [obj1, obj2, null, null, null]);


        main.addDirtyObject(obj3);
        main.addDeletedObject(obj1);
        sync();
        compareState(main.getArray(), [null, obj2, obj3, null, null]);
        compareState(slave.getArray(), [null, obj2, obj3, null, null]);

        main.addDirtyObject(obj4);
        sync();
        compareState(main.getArray(), [obj4, obj2, obj3, null, null]);
        compareState(slave.getArray(), [obj4, obj2, obj3, null, null]);

        expectThrow(() => {
            main.replaceObjectAtIndex(3, obj4);
        })
        sync();
        compareState(main.getArray(), [obj4, obj2, obj3, null, null]);
        compareState(slave.getArray(), [obj4, obj2, obj3, null, null]);

        main.replaceObjectAtIndex(4, obj5);
        sync();
        compareState(main.getArray(), [obj4, obj2, obj3, null, obj5]);
        compareState(slave.getArray(), [obj4, obj2, obj3, null, obj5]);


        main.addDeletedObject(obj4);
        main.addDeletedObject(obj2);
        main.addDeletedObject(obj3);
        main.addDeletedObject(obj5);
        sync();
        compareState(main.getArray(), [null, null, null, null, null]);
        compareState(slave.getArray(), [null, null, null, null, null]);
    }

    public static power() {
        const MAX = 500000;
        const UPDATE = 100000;
        console.log("Testing with " + MAX + " objects");
        const start = performance.now();
        const main = new ExampleMasterObjectArray(MAX);
        for (let i = 0; i < MAX; i++) {
            const obj: MasterObject = {
                metaId: Math.round(Math.random() * 250) + 1,
                x: Math.round(Math.random() * 250),
                y: Math.round(Math.random() * 250),
                sx: Math.round(Math.random() * 30000),
                sy: Math.round(Math.random() * 30000)
            };
            main.addDirtyObject(obj);
        }
        console.log("A1: " + (performance.now() - start) + " (populate main)");

        const start2 = performance.now();
        main.flushToMemorySync();
        console.log("A2: " + (performance.now() - start2) + " (sync to memory)");

        const start3 = performance.now();
        const slave = new ExampleSlaveObjectArray(main.export()).init();
        console.log("A3: " + (performance.now() - start3) + " (start slave)");

        const start4 = performance.now();
        slave.populateObjects();
        console.log("A4: " + (performance.now() - start4) + " (populate slave)");

        const start5 = performance.now();
        main.flushToMemorySync();
        console.log("A5: " + (performance.now() - start5) + " (empty flush from main)");

        const start6 = performance.now();
        slave.populateObjects();
        console.log("A6: " + (performance.now() - start6) + " (empty read from slave)");

        const start7 = performance.now();
        slave.populateObjects();
        console.log("A7: " + (performance.now() - start7) + " (empty read from slave)");

        const start8 = performance.now();
        const objects = main.getArray();
        for (let i = 0; i < UPDATE; i++) {
            objects[i].x = 10;
            main.addDirtyObject(objects[i]);
        }
        for (let i = UPDATE; i < UPDATE + UPDATE; i++) {
            main.addDeletedObject(objects[i]);
        }
        console.log("A8: " + (performance.now() - start8) + " (update elements, delete elements)");

        const start9 = performance.now();
        main.flushToMemorySync();
        console.log("A9: " + (performance.now() - start9) + " (sync to memory)");

        const start10 = performance.now();
        const res = slave.populateObjects();
        console.log("A10: " + (performance.now() - start10) + " (read from slave - updated: " + res.updated.length + " deleted: " + res.deleted.length + ")");

        const start11 = performance.now();
        const res2 = slave.populateObjects();
        console.log("A11: " + (performance.now() - start11) + " (read from slave - updated: " + res2.updated.length + " deleted: " + res2.deleted.length + ")");

    }

}
