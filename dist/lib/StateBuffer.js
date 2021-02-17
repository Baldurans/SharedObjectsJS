"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateBuffer = void 0;
var StateBuffer = /** @class */ (function () {
    function StateBuffer(buffersOrMaxObjects) {
        if (typeof buffersOrMaxObjects === "number") {
            this.controlBuffer = new Int32Array(new SharedArrayBuffer(StateBuffer.CONTROL_BUFFER_LENGTH * Uint32Array.BYTES_PER_ELEMENT));
            this.changesBuffer = new Uint32Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint32Array.BYTES_PER_ELEMENT));
            this.isDirtyBuffer = new Uint8Array(new SharedArrayBuffer(buffersOrMaxObjects * Uint8Array.BYTES_PER_ELEMENT));
        }
        else {
            this.controlBuffer = new Int32Array(buffersOrMaxObjects.controlBuffer);
            this.changesBuffer = new Uint32Array(buffersOrMaxObjects.changesBuffer);
            this.isDirtyBuffer = new Uint8Array(buffersOrMaxObjects.isDirtyBuffer);
        }
    }
    StateBuffer.prototype.lock = function () {
        while (true) {
            var oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
            if (oldValue === StateBuffer.UNLOCKED) {
                return;
            }
            Atomics.wait(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED);
        }
    };
    StateBuffer.prototype.releaseLock = function () {
        var oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.LOCKED, StateBuffer.UNLOCKED);
        if (oldValue != StateBuffer.LOCKED) {
            throw new Error('Tried to unlock while not holding the mutex');
        }
        Atomics.notify(this.controlBuffer, StateBuffer.LOCK_INDEX, 1);
    };
    StateBuffer.prototype.executeLocked = function (callback) {
        var _this = this;
        var oldValue = Atomics.compareExchange(this.controlBuffer, StateBuffer.LOCK_INDEX, StateBuffer.UNLOCKED, StateBuffer.LOCKED);
        if (oldValue == StateBuffer.UNLOCKED) {
            callback();
            this.releaseLock();
            return;
        }
        else {
            setTimeout(function () {
                _this.executeLocked(callback);
            }, 0);
        }
    };
    StateBuffer.CONTROL_BUFFER_LENGTH = 3;
    // control buffer keys
    StateBuffer.NO_OF_OBJECTS_INDEX = 0;
    StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX = 1;
    StateBuffer.LOCK_INDEX = 2;
    StateBuffer.UNLOCKED = 0;
    StateBuffer.LOCKED = 1;
    StateBuffer.CLEAN = 0;
    StateBuffer.DIRTY = 1;
    return StateBuffer;
}());
exports.StateBuffer = StateBuffer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVCdWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL1N0YXRlQnVmZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBO0lBNEJJLHFCQUFzQixtQkFBK0M7UUFDakUsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFFBQVEsRUFBRTtZQUN6QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksaUJBQWlCLENBQUMsV0FBVyxDQUFDLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7WUFDN0gsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7WUFDaEgsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7U0FDakg7YUFBTTtZQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUN2RSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFBO1NBQ3pFO0lBQ0wsQ0FBQztJQUVNLDBCQUFJLEdBQVg7UUFDSSxPQUFPLElBQUksRUFBRTtZQUNULElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9ILElBQUksUUFBUSxLQUFLLFdBQVcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25DLE9BQU87YUFDVjtZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoRjtJQUNMLENBQUM7SUFFTSxpQ0FBVyxHQUFsQjtRQUNJLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9ILElBQUksUUFBUSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVNLG1DQUFhLEdBQXBCLFVBQXFCLFFBQW9CO1FBQXpDLGlCQVdDO1FBVkcsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0gsSUFBSSxRQUFRLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUNsQyxRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixPQUFPO1NBQ1Y7YUFBTTtZQUNILFVBQVUsQ0FBQztnQkFDUCxLQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNUO0lBQ0wsQ0FBQztJQXREYyxpQ0FBcUIsR0FBRyxDQUFDLENBQUM7SUFFekMsc0JBQXNCO0lBQ1IsK0JBQW1CLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLHFDQUF5QixHQUFHLENBQUMsQ0FBQztJQUM3QixzQkFBVSxHQUFHLENBQUMsQ0FBQztJQUVmLG9CQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2Isa0JBQU0sR0FBRyxDQUFDLENBQUM7SUFFWixpQkFBSyxHQUFHLENBQUMsQ0FBQztJQUNWLGlCQUFLLEdBQUcsQ0FBQyxDQUFDO0lBNkM1QixrQkFBQztDQUFBLEFBdkVELElBdUVDO0FBdkVxQixrQ0FBVyJ9