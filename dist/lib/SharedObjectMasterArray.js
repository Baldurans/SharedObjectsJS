"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedObjectMasterArray = void 0;
var StateBufferForMaster_1 = require("./StateBufferForMaster");
var SharedObjectMasterArray = /** @class */ (function () {
    function SharedObjectMasterArray(maxObjects) {
        var _this = this;
        this.stateBuffer = new StateBufferForMaster_1.StateBufferForMaster(maxObjects, {
            populateMemory: function (index, obj) {
                _this.populateMemory(index, obj);
            },
            deleteMemory: function (index) {
                _this.deleteMemory(index);
            }
        });
    }
    SharedObjectMasterArray.prototype.replaceObjectAtIndex = function (index, object) {
        this.stateBuffer.replaceObjectAt(index, object);
    };
    SharedObjectMasterArray.prototype.initPeriodicFlush = function (fps) {
        this.stateBuffer.initPeriodicFlush(fps);
    };
    SharedObjectMasterArray.prototype.clearPeriodicFlush = function () {
        this.stateBuffer.clearPeriodicFlush();
    };
    SharedObjectMasterArray.prototype.flushToMemory = function () {
        this.stateBuffer.flushToMemory();
    };
    SharedObjectMasterArray.prototype.flushToMemorySync = function () {
        this.stateBuffer.flushToMemorySync();
    };
    SharedObjectMasterArray.prototype.dirtyObject = function (obj) {
        this.stateBuffer.dirtyObject(obj);
    };
    SharedObjectMasterArray.prototype.deleteObject = function (obj) {
        this.stateBuffer.deleteObject(obj);
    };
    SharedObjectMasterArray.prototype.moveAllToLeft = function () {
        this.stateBuffer.moveAllToLeft();
    };
    SharedObjectMasterArray.prototype.export = function () {
        return this.stateBuffer.export();
    };
    SharedObjectMasterArray.prototype.getArray = function () {
        return this.stateBuffer.getArray();
    };
    SharedObjectMasterArray.prototype.get = function (index) {
        return this.stateBuffer.get(index);
    };
    return SharedObjectMasterArray;
}());
exports.SharedObjectMasterArray = SharedObjectMasterArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcmVkT2JqZWN0TWFzdGVyQXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL1NoYXJlZE9iamVjdE1hc3RlckFycmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUErRTtBQUUvRTtJQUlJLGlDQUFzQixVQUFrQjtRQUF4QyxpQkFTQztRQVJHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwyQ0FBb0IsQ0FBQyxVQUFVLEVBQUU7WUFDcEQsY0FBYyxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUc7Z0JBQ3ZCLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ25DLENBQUM7WUFDRCxZQUFZLEVBQUUsVUFBQyxLQUFLO2dCQUNoQixLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzVCLENBQUM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBTU0sc0RBQW9CLEdBQTNCLFVBQTRCLEtBQWEsRUFBRSxNQUFTO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU0sbURBQWlCLEdBQXhCLFVBQXlCLEdBQVk7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sb0RBQWtCLEdBQXpCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTSwrQ0FBYSxHQUFwQjtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVNLG1EQUFpQixHQUF4QjtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRU0sNkNBQVcsR0FBbEIsVUFBbUIsR0FBTTtRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sOENBQVksR0FBbkIsVUFBb0IsR0FBTTtRQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sK0NBQWEsR0FBcEI7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFTSx3Q0FBTSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFTSwwQ0FBUSxHQUFmO1FBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxxQ0FBRyxHQUFWLFVBQVcsS0FBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTCw4QkFBQztBQUFELENBQUMsQUE5REQsSUE4REM7QUE5RHFCLDBEQUF1QiJ9