import {ExampleBuffersExport, ExampleMasterObjectArray, ExampleSlaveObjectArray, MasterObject} from "./Example";

function toStr(obj: any) {
    let str: string [] = [];
    for (const k in obj) {
        str.push(k + "=" + obj[k]);
    }
    return "{" + str.join(", ") + "}";
}

function compare(a: any, b: any) {
    const astr = toStr(a);
    const bstr = toStr(b);
    if (astr === bstr) {
        console.log(astr + " === " + bstr);
    } else {
        console.error(astr + " === " + bstr)
    }
}

const obj1: MasterObject = {metaId: 1, x: 2, y: 3, sx: 12345, sy: 54321};
const obj2: MasterObject = {metaId: 2, x: 4, y: 5, sx: 11111, sy: 22222};
const obj3: MasterObject = {metaId: 3, x: 6, y: 7, sx: 3333, sy: 4444};
const obj4: MasterObject = {metaId: 4, x: 8, y: 9, sx: 3333, sy: 4444};

export class Test {

    public static main(worker: Worker) {
        const main = new ExampleMasterObjectArray(5);
        worker.postMessage(main.export());

        main.addDirtyObject(obj1);
        main.addDirtyObject(obj2);

        setInterval(() => {
            main.flushToMemory();
        }, 1);

        const steps = [
            () => {
                main.addDeletedObject(obj3);
                main.addDirtyObject(obj3);
            },
            () => {
                main.addDeletedObject(obj1);
            },
            () => {
                main.addDirtyObject(obj4);
            },
            () => {
                main.replaceObjectAtIndex(3, obj4);
            }
        ]
        const t = 100;
        steps.forEach((value, index) => {
            setTimeout(() => {
                value();
                console.log("Update " + index + " done");
                console.log(main);
            }, t + index * t);
        });
    }

    public static slave(buffers: ExampleBuffersExport) {
        const slave = new ExampleSlaveObjectArray(buffers).init();
        const func = () => {
            const changes = slave.sync();
            if (changes.deleted.length > 0) {
                console.log("Slave Deleted " + changes.deleted.length, JSON.stringify(changes.deleted));
                console.log(slave);
            }
            if (changes.updated.length > 0) {
                console.log("Slave Updated " + changes.updated.length, JSON.stringify(changes.updated));
                console.log(slave);
            }
            requestAnimationFrame(func);
        }

        setTimeout(() => {
            const finalState = slave.getArray();

            compare(finalState[0], null);
            compare(finalState[1], obj2);
            compare(finalState[2], null);
            compare(finalState[3], obj4);
            compare(finalState[4], null);

            console.log(finalState);
        }, 1000)
        func();
    }

}
