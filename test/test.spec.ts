import {ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";

test("main", () => {

    const obj1: MasterObject = {metaId: 1, x: 2, y: 3, sx: 12345, sy: 54321};
    const obj2: MasterObject = {metaId: 2, x: 4, y: 5, sx: 11111, sy: 22222};
    const obj3: MasterObject = {metaId: 3, x: 6, y: 7, sx: 3333, sy: 4444};
    const obj4: MasterObject = {metaId: 4, x: 8, y: 9, sx: 3333, sy: 4444};
    const obj5: MasterObject = {metaId: 5, x: 8, y: 9, sx: 3333, sy: 4444};

    const main = new ExampleMasterObjectArray(5);
    const slave = new ExampleSlaveObjectArray(main.export());
    slave.resetReport();

    function sync(added: any[], updated: any[], deleted: any[]) {
        main.flushToMemorySync();
        const res = slave.sync();
        expect(res).toEqual(added.length > 0 || updated.length > 0 || deleted.length > 0);
        expect(slave.report).toEqual({
            added: added,
            updated: updated,
            deleted: deleted
        });
        slave.resetReport();
    }

    function compareState(store: { getArray(): any[] }, match: any[]) {
        expect(store.getArray()).toEqual(match);
    }

    compareState(main, []);
    compareState(slave, []);

    main.dirtyObject(obj1);
    main.dirtyObject(obj2);
    compareState(main, [obj1, obj2]);
    compareState(slave, []);
    sync([obj1, obj2], [], []);
    compareState(main, [obj1, obj2]);
    compareState(slave, [obj1, obj2]);


    main.replaceObjectAt(4, obj5);
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2]);
    sync([obj5], [], []);
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);

    main.dirtyObject(obj5);
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);
    sync([], [obj5], []);
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);

    expect(() => {
        main.dirtyObject(obj3); // Max objects reached
    }).toThrow();
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);
    sync([], [], []);
    compareState(main, [obj1, obj2, undefined, undefined, obj5]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);

    main.deleteObject(obj5);
    compareState(main, [obj1, obj2, undefined, undefined, undefined]);
    compareState(slave, [obj1, obj2, undefined, undefined, obj5]);
    sync([], [], [obj5]);
    compareState(main, [obj1, obj2, undefined, undefined, undefined]);
    compareState(slave, [obj1, obj2, undefined, undefined, undefined]);

    main.moveAllToLeft();
    compareState(main, [obj1, obj2]);
    compareState(slave, [obj1, obj2, undefined, undefined, undefined]);
    sync([], [], []);
    compareState(main, [obj1, obj2]);
    compareState(slave, [obj1, obj2]);


    main.dirtyObject(obj3);
    compareState(main, [obj1, obj2, obj3]);
    compareState(slave, [obj1, obj2]);
    sync([obj3], [], []);
    compareState(main, [obj1, obj2, obj3]);
    compareState(slave, [obj1, obj2, obj3]);

    main.deleteObject(obj1);
    compareState(main, [undefined, obj2, obj3]);
    compareState(slave, [obj1, obj2, obj3]);
    sync([], [], [obj1]);
    compareState(main, [undefined, obj2, obj3]);
    compareState(slave, [undefined, obj2, obj3]);


    main.dirtyObject(obj4);
    compareState(main, [obj4, obj2, obj3]);
    compareState(slave, [undefined, obj2, obj3]);
    sync([obj4], [], []);
    compareState(main, [obj4, obj2, obj3]);
    compareState(slave, [obj4, obj2, obj3]);


    main.replaceObjectAt(2, obj4);
    compareState(main, [undefined, obj2, obj4]);
    compareState(slave, [obj4, obj2, obj3]);
    sync([obj4], [], [obj3, obj4]);
    compareState(main, [undefined, obj2, obj4]);
    compareState(slave, [undefined, obj2, obj4]);


    main.replaceObjectAt(2, obj5);
    compareState(main, [undefined, obj2, obj5]);
    compareState(slave, [undefined, obj2, obj4]);
    sync([obj5], [], [obj4]);
    compareState(main, [undefined, obj2, obj5]);
    compareState(slave, [undefined, obj2, obj5]);


    main.moveAllToLeft();
    compareState(main, [obj2, obj5]);
    compareState(slave, [undefined, obj2, obj5]);
    sync([obj5, obj2], [], [obj2, obj5]);
    compareState(main, [obj2, obj5]);
    compareState(slave, [obj2, obj5]);


    main.deleteObject(obj2);
    main.deleteObject(obj5);
    sync([], [], [obj2, obj5]);
    compareState(main, [undefined, undefined]);
    compareState(slave, [undefined, undefined]);


});
