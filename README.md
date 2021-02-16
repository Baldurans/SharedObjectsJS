# Share objects in WebWorkers using SharedArrayBuffer


## Example
```
// setting up your structure
class MyArray extends SharedObjectArray<Uint32Array, MyObject> {
    constructor(buffer?: SharedArrayBuffer) {
        // 5 - max objects
        // 2 - size of an object
        super(5, 2, buffer);
    }
    protected createBlankObject(): MyObject {
        return new MyObject(null);
    }
    protected getTypedArray() {
        return Uint32Array;
    }
}
class MyObject extends MemoryObject<Uint32Array, MyArray> {
    constructor( something: number ) {
        super(() => {
            this.__setValueAt(0, 1);
            if( something !== null ) {
                this.something = something;
            }
        });
    }
    public set something(something: number) {
        this.__setValueAt(1, something);
    }
    public get something(): number {
        return this.__getValueAt(1);
    }
}

// in your main process
const arr1 = new MyArray();
arr1.add(new MyObject(1, 2));
arr1.add(new MyObject(5, 6));
arr1.add(new MyObject(7, 8));
arr1.set(4, new MyObject(9, 10));

// in web worker
const arr2 = new MyArray(arr1.getBuffer());
arr.forEach(( item ) => {

});
```

## WEAKNESSES
* No atomic action protection. My use case assumed webWorkers only need to read, so didn't focus on this.
* A lot smaller limitations on how objects are handled. All of them were fine for my use case, but more advanced solution can be built.


## CONCLUSION
Do what ever you want with it.

Thought it might be useful for someone to develop on top of this idea to make SharedArrayBuffer easier to use for a bit more complex cases than just sharing list of numbers.
I also did not find any library that would do something similar that would work in latest browsers.

Unfortunately I didn't have time to focus on this too much to make it a proper library... :(