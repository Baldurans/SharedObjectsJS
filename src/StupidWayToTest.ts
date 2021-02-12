import {MemoryObject, SharedObjectArray} from "./JsSharedObjects";

export function StupidWayToTestSharedMemoryButIAmLazy() {

    class MyArray extends SharedObjectArray<Uint32Array, MyObject> {

        constructor(buffer?: SharedArrayBuffer) {
            super(5, 3, buffer);
        }

        protected createBlankObject(): MyObject {
            return new MyObject(null, null);
        }

        protected getTypedArray() {
            return Uint32Array;
        }
    }

    class MyObject extends MemoryObject<Uint32Array, MyArray> {

        constructor(x: number, y: number) {
            super(() => {
                this.__setValueAt(0, 1);
                if (x !== null && y !== null) {
                    this.x = x;
                    this.y = y;
                }
            });
        }

        public static getLength(): number {
            return 3;
        }

        public set x(x: number) {
            this.__setValueAt(1, x);
        }

        public get x(): number {
            return this.__getValueAt(1);
        }

        public set y(y: number) {
            this.__setValueAt(2, y);
        }

        public get y(): number {
            return this.__getValueAt(2);
        }

        public toString() {
            return this.x + ":" + this.y;
        }

    }

    const test = (a: any, b: any) => {
        if (String(a) === String(b)) {
            console.log(a + " === " + b);
        } else {
            console.error(a + " !== " + b);
        }
    }

    const testThrow = (msg: string, callback: () => void) => {
        try {
            callback();
            console.error("Did not throw on overflow!");
        } catch (e) {
            console.log("Set overwrite test 1 success");
        }
    }

    const arr1 = new MyArray();
    arr1.add(new MyObject(1, 2));
    testThrow("Set overwrite test 1", () => {
        arr1.set(0, new MyObject(77, 88));
    });

    arr1.add(new MyObject(3, 4));
    testThrow("Set overwrite test 2", () => {
        arr1.set(1, new MyObject(77, 88));
    });

    arr1.add(new MyObject(5, 6));
    arr1.add(new MyObject(7, 8));
    arr1.set(4, new MyObject(9, 10));
    const arr2 = new MyArray(arr1.getBuffer());

    test(arr1, "(5) [1:2,3:4,5:6,7:8,9:10]");
    test(arr2, "(5) [1:2,3:4,5:6,7:8,9:10]");

    arr1.get(0).delete();
    arr1.get(4).delete();
    arr1.get(1).delete();
    test(arr1, "(5) [5:6,7:8]");
    test(arr2, "(5) [5:6,7:8]");
    test(arr1.get(0), "null");
    test(arr1.get(2), "5:6");
    test(arr2.get(0), "null");
    test(arr2.get(2), "5:6");

    arr1.optimize();
    test(arr1, "(2) [5:6,7:8]");
    test(arr2, "(2) [5:6,7:8]");
    test(arr1.get(0), "5:6");
    test(arr1.get(1), "7:8");
    test(arr1.get(2), "null");

    arr1.get(1).x = 100;
    arr1.get(1).y = 200;
    test(arr1.get(1), "100:200")
    test(arr2.get(1), "100:200")

}
