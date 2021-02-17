"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateBufferForMaster = void 0;
var StateBuffer_1 = require("./StateBuffer");
var StateBufferForMaster = /** @class */ (function (_super) {
    __extends(StateBufferForMaster, _super);
    function StateBufferForMaster(maxObjects, listeners) {
        var _this = _super.call(this, maxObjects) || this;
        _this.indexToObject = [];
        _this.objectToIndex = new Map();
        _this.dirty = new Set();
        _this.noOfObjects = 0;
        _this.unusedIndexes = [];
        _this.isFlushing = false;
        _this.maxObjects = maxObjects;
        _this.listeners = listeners;
        return _this;
    }
    StateBufferForMaster.prototype.initPeriodicFlush = function (fps) {
        var _this = this;
        if (this.flushInterval) {
            return;
        }
        this.flushInterval = setInterval(function () {
            _this.flushToMemory();
        }, Math.floor(1000 / (fps ? fps : StateBufferForMaster.FLUSH_FPS)));
    };
    StateBufferForMaster.prototype.clearPeriodicFlush = function () {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
    };
    StateBufferForMaster.prototype.flushToMemorySync = function () {
        this.lock();
        this._flushToMemory();
        this.releaseLock();
    };
    StateBufferForMaster.prototype.flushToMemory = function () {
        var _this = this;
        if (this.isFlushing === true) {
            return;
        }
        this.isFlushing = true;
        this.executeLocked(function () {
            _this._flushToMemory();
            _this.isFlushing = false;
        });
    };
    StateBufferForMaster.prototype._flushToMemory = function () {
        this.handleDirty();
        this.controlBuffer[StateBuffer_1.StateBuffer.NO_OF_OBJECTS_INDEX] = this.noOfObjects;
    };
    StateBufferForMaster.prototype.handleDirty = function () {
        var _this = this;
        this.dirty.forEach(function (index) {
            var obj = _this.indexToObject[index];
            if (obj) {
                _this.listeners.populateMemory(index, obj);
            }
            else {
                _this.listeners.deleteMemory(index);
            }
            if (_this.isDirtyBuffer[index] === StateBuffer_1.StateBuffer.CLEAN) {
                var nextI = _this.controlBuffer[StateBuffer_1.StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX];
                _this.controlBuffer[StateBuffer_1.StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX]++;
                _this.changesBuffer[nextI] = index;
                _this.isDirtyBuffer[index] = StateBuffer_1.StateBuffer.DIRTY;
            }
        });
        this.dirty.clear();
    };
    StateBufferForMaster.prototype.replaceObjectAt = function (index, object) {
        if (this.indexToObject[index]) {
            this.deleteObject(this.indexToObject[index]);
        }
        if (this.objectToIndex.has(object)) {
            this.deleteObject(object);
        }
        if (index >= this.noOfObjects) {
            this.noOfObjects = index + 1;
        }
        this.addObjectToIndex(object, index);
    };
    StateBufferForMaster.prototype.dirtyObject = function (object) {
        var index = this.objectToIndex.get(object);
        if (index === undefined) {
            if (this.unusedIndexes.length > 0) {
                index = this.getNextUnusedIndex();
            }
            else {
                if (this.noOfObjects === this.maxObjects) {
                    throw new Error("MAX objects reached!" + this.noOfObjects + "/" + this.maxObjects);
                }
                index = this.noOfObjects;
                this.noOfObjects++;
            }
            this.addObjectToIndex(object, index);
        }
        else {
            this.dirty.add(index);
        }
    };
    StateBufferForMaster.prototype.getNextUnusedIndex = function () {
        while (true) {
            if (this.unusedIndexes.length === 0) {
                return undefined;
            }
            var index = this.unusedIndexes.pop();
            if (this.indexToObject[index] === undefined) {
                return index;
            }
        }
    };
    StateBufferForMaster.prototype.addObjectToIndex = function (object, index) {
        this.objectToIndex.set(object, index);
        this.indexToObject[index] = object;
        this.dirty.add(index);
    };
    StateBufferForMaster.prototype.deleteObject = function (object) {
        var index = this.objectToIndex.get(object);
        if (index === undefined) {
            return;
        }
        this.unusedIndexes.push(index);
        this.objectToIndex.delete(object);
        this.indexToObject[index] = undefined;
        this.dirty.add(index);
    };
    /**
     * Optimizes memory usage by moving all items to left if there are unused indexes. O(n)
     * Use this only if you understand when it is useful and when it is useless. addDirty reuses indexes that have been deleted.
     * In most cases you do not need this.
     */
    StateBufferForMaster.prototype.moveAllToLeft = function () {
        var nextObjIndex = 0;
        for (var i = 0; i < this.indexToObject.length; i++) {
            var current = this.indexToObject[i];
            if (current === undefined) {
                continue;
            }
            if (nextObjIndex !== i) {
                this.objectToIndex.delete(current);
                this.indexToObject[i] = undefined;
                this.objectToIndex.set(current, nextObjIndex);
                this.indexToObject[nextObjIndex] = current;
                this.dirty.add(i);
                this.dirty.add(nextObjIndex);
            }
            nextObjIndex++;
        }
        this.unusedIndexes.length = 0;
        this.indexToObject.length = nextObjIndex;
        this.noOfObjects = nextObjIndex;
    };
    StateBufferForMaster.prototype.getArray = function () {
        return this.indexToObject;
    };
    StateBufferForMaster.prototype.get = function (index) {
        return this.indexToObject[index];
    };
    StateBufferForMaster.prototype.export = function () {
        return {
            controlBuffer: this.controlBuffer.buffer,
            changesBuffer: this.changesBuffer.buffer,
            isDirtyBuffer: this.isDirtyBuffer.buffer
        };
    };
    StateBufferForMaster.FLUSH_FPS = 60;
    return StateBufferForMaster;
}(StateBuffer_1.StateBuffer));
exports.StateBufferForMaster = StateBufferForMaster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVCdWZmZXJGb3JNYXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL1N0YXRlQnVmZmVyRm9yTWFzdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBMEM7QUFPMUM7SUFBNEQsd0NBQVc7SUFnQm5FLDhCQUFZLFVBQWtCLEVBQUUsU0FBMkM7UUFBM0UsWUFDSSxrQkFBTSxVQUFVLENBQUMsU0FHcEI7UUFqQmdCLG1CQUFhLEdBQVEsRUFBRSxDQUFDO1FBQ3hCLG1CQUFhLEdBQW1CLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUMsV0FBSyxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBR3RDLGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLG1CQUFhLEdBQWEsRUFBRSxDQUFDO1FBRS9CLGdCQUFVLEdBQUcsS0FBSyxDQUFDO1FBT3ZCLEtBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLEtBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDOztJQUMvQixDQUFDO0lBRU0sZ0RBQWlCLEdBQXhCLFVBQXlCLEdBQVk7UUFBckMsaUJBT0M7UUFORyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7WUFDN0IsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVNLGlEQUFrQixHQUF6QjtRQUNJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNwQixhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0wsQ0FBQztJQUVNLGdEQUFpQixHQUF4QjtRQUNJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLDRDQUFhLEdBQXBCO1FBQUEsaUJBU0M7UUFSRyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQzFCLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDZixLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsS0FBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sNkNBQWMsR0FBdEI7UUFDSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMzRSxDQUFDO0lBRU8sMENBQVcsR0FBbkI7UUFBQSxpQkFrQkM7UUFqQkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO1lBRXJCLElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsS0FBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzdDO2lCQUFNO2dCQUNILEtBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsSUFBSSxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLHlCQUFXLENBQUMsS0FBSyxFQUFFO2dCQUNqRCxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLHlCQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQTtnQkFDdkUsS0FBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBVyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQztnQkFDNUQsS0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLEtBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcseUJBQVcsQ0FBQyxLQUFLLENBQUM7YUFDakQ7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLDhDQUFlLEdBQXRCLFVBQXVCLEtBQWEsRUFBRSxNQUFTO1FBQzNDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sMENBQVcsR0FBbEIsVUFBbUIsTUFBUztRQUN4QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDckIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUNyQztpQkFBTTtnQkFDSCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3RGO2dCQUNELEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUN6QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDdEI7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFFTyxpREFBa0IsR0FBMUI7UUFDSSxPQUFPLElBQUksRUFBRTtZQUNULElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLFNBQVMsQ0FBQzthQUNwQjtZQUNELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVMsRUFBRTtnQkFDekMsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjtJQUNMLENBQUM7SUFFTywrQ0FBZ0IsR0FBeEIsVUFBeUIsTUFBUyxFQUFFLEtBQWE7UUFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTSwyQ0FBWSxHQUFuQixVQUFvQixNQUFTO1FBQ3pCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUNyQixPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLDRDQUFhLEdBQXBCO1FBQ0ksSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtnQkFDdkIsU0FBUzthQUNaO1lBRUQsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNoQztZQUVELFlBQVksRUFBRSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUN6QyxJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztJQUNwQyxDQUFDO0lBRU0sdUNBQVEsR0FBZjtRQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRU0sa0NBQUcsR0FBVixVQUFXLEtBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxxQ0FBTSxHQUFiO1FBQ0ksT0FBTztZQUNILGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQTJCO1lBQzdELGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQTJCO1lBQzdELGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQTJCO1NBQ2hFLENBQUE7SUFDTCxDQUFDO0lBeEtzQiw4QkFBUyxHQUFHLEVBQUUsQ0FBQztJQXlLMUMsMkJBQUM7Q0FBQSxBQXZMRCxDQUE0RCx5QkFBVyxHQXVMdEU7QUF2TFksb0RBQW9CIn0=