export class MyObject extends MemoryObject {

    private myConfig: any;

    constructor( myconfig:any) {
        this.myConfig = myconfig;
        super();
    }

    public syncData( obj: MyObject ) {

    }

    public get x(): number {
        return this.__get("x");
    }

}

export class MyMemory extends Memory<MyObject> {

    public getNew(): MyObject {
        return null
    }

    public getNewAt(index: number): MyObject {
        return null
    }

    public get(index: number): MyObject | null {
        return null;
    }

    public delete(index: number): void {

    }

}


export class MyMemorySlave extends MemorySlave<MyObject> {

    public getChanges(callback: (item: MyObject) => void): Array<{old: MyObject, new: MyObject}> {
        return [];
    }
}



const s = new MyMemory();

