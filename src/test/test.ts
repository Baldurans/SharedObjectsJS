import {ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";

export class Test {

    public static test() {

        const obj1: MasterObject = {metaId: 1, x: 2, y: 3, sx: 12345, sy: 54321};
        const obj2: MasterObject = {metaId: 2, x: 4, y: 5, sx: 11111, sy: 22222};

        const main = new ExampleMasterObjectArray();
        main.addDirtyObject(obj1);
        main.addDirtyObject(obj2);
        main.flushToMemory();

        const slave = new ExampleSlaveObjectArray(main.export()).init();
        const changes = slave.populateObjects();
        console.log(changes);


    }


}
