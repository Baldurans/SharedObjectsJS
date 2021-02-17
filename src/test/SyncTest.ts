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
        throw new Error(msg + ") " + astr + " === " + bstr);
    }
}

function comapreArray(msg: string, a: any[], b: any[]) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
        try {
            compare(msg + " [" + i + "] ", a[i], b[i]);
        } catch (e) {
            console.error(a, b);
            throw e;
        }
    }
}

function expectThrow(func: () => void) {
    let did = false;
    try {
        func();
        did = true;
    } catch (e) {
        if (did) {
            throw new Error("Expected to throw!")
        }
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

        function sync(updated: any[], deleted: any[]) {
            main.flushToMemorySync();
            const res = slave.sync();
            comapreArray("updated", res.updated, updated);
            comapreArray("deleted", res.deleted, deleted);
        }

        function compareState(store: { getArray(): any[] }, match: any[]) {
            comapreArray("state", store.getArray(), match);
        }

        compareState(main, [null, null, null, null, null]);
        compareState(slave, [null, null, null, null, null]);

        main.dirtyObject(obj1);
        main.dirtyObject(obj2);
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [null, null, null, null, null]);
        sync([obj1, obj2], []);
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [obj1, obj2, null, null, null]);


        main.replaceObjectAtIndex(4, obj5);
        compareState(main, [obj1, obj2, null, null, obj5]);
        compareState(slave, [obj1, obj2, null, null, null]);
        sync([obj5], []);
        compareState(main, [obj1, obj2, null, null, obj5]);
        compareState(slave, [obj1, obj2, null, null, obj5]);


        expectThrow(() => {
            main.dirtyObject(obj3);
        });
        compareState(main, [obj1, obj2, null, null, obj5]);
        compareState(slave, [obj1, obj2, null, null, obj5]);
        sync([], []);
        compareState(main, [obj1, obj2, null, null, obj5]);
        compareState(slave, [obj1, obj2, null, null, obj5]);

        main.deleteObject(obj5);
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [obj1, obj2, null, null, obj5]);
        sync([], [obj5]);
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [obj1, obj2, null, null, null]);

        main.moveAllToLeft();
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [obj1, obj2, null, null, null]);
        sync([], []);
        compareState(main, [obj1, obj2, null, null, null]);
        compareState(slave, [obj1, obj2, null, null, null]);


        main.dirtyObject(obj3);
        compareState(main, [obj1, obj2, obj3, null, null]);
        compareState(slave, [obj1, obj2, null, null, null]);
        sync([obj3], []);
        compareState(main, [obj1, obj2, obj3, null, null]);
        compareState(slave, [obj1, obj2, obj3, null, null]);


        main.deleteObject(obj1);
        compareState(main, [null, obj2, obj3, null, null]);
        compareState(slave, [obj1, obj2, obj3, null, null]);
        sync([], [obj1]);
        compareState(main, [null, obj2, obj3, null, null]);
        compareState(slave, [null, obj2, obj3, null, null]);


        main.dirtyObject(obj4);
        compareState(main, [obj4, obj2, obj3, null, null]);
        compareState(slave, [null, obj2, obj3, null, null]);
        sync([obj4], []);
        compareState(main, [obj4, obj2, obj3, null, null]);
        compareState(slave, [obj4, obj2, obj3, null, null]);


        main.replaceObjectAtIndex(2, obj4);
        compareState(main, [null, obj2, obj4, null, null]);
        compareState(slave, [obj4, obj2, obj3, null, null]);
        sync([obj4], [obj4]);
        compareState(main, [null, obj2, obj4, null, null]);
        compareState(slave, [null, obj2, obj4, null, null]);


        main.moveAllToLeft();
        compareState(main, [obj2, obj4, null, null, null]);
        compareState(slave, [null, obj2, obj4, null, null]);
        sync([obj4, obj2], [obj4]);
        compareState(main, [obj2, obj4, null, null, null]);
        compareState(slave, [obj2, obj4, null, null, null]);


        main.deleteObject(obj2);
        main.deleteObject(obj4);
        sync([], [obj2, obj4]);
        compareState(main, [null, null, null, null, null]);
        compareState(slave, [null, null, null, null, null]);
    }

    public static power() {
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

    }

}
