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

function compareArray(msg: string, a: any[], b: any[]) {
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

test("main", () => {

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
        compareArray("updated", res.updated, updated);
        compareArray("deleted", res.deleted, deleted);
    }

    function compareState(store: { getArray(): any[] }, match: any[]) {
        compareArray("state", store.getArray(), match);
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


});
