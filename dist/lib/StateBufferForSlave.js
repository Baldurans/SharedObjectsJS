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
exports.StateBufferForSlave = void 0;
var StateBuffer_1 = require("./StateBuffer");
var StateBufferForSlave = /** @class */ (function (_super) {
    __extends(StateBufferForSlave, _super);
    function StateBufferForSlave(buffers, listeners) {
        var _this = _super.call(this, buffers) || this;
        _this.objects = [];
        _this.listeners = listeners;
        return _this;
    }
    StateBufferForSlave.prototype.init = function () {
        this.lock();
        var noOfObjects = this.controlBuffer[StateBufferForSlave.NO_OF_OBJECTS_INDEX];
        for (var i = 0; i < noOfObjects; i++) {
            this.objects[i] = this.listeners.updateObject(i, null);
        }
        this.releaseLock();
    };
    StateBufferForSlave.prototype.sync = function () {
        var changes = {
            deleted: [],
            updated: []
        };
        this.lock();
        var noOfChanges = this.controlBuffer[StateBufferForSlave.NO_OF_DIRTY_OBJECTS_INDEX];
        for (var i = 0; i < noOfChanges; i++) {
            var index = this.changesBuffer[i];
            var existing = this.objects[index] || null;
            var updated = this.listeners.updateObject(index, existing) || null;
            if (updated) {
                changes.updated.push(updated);
            }
            else if (existing) {
                changes.deleted.push(existing);
            }
            this.objects[index] = updated;
            this.isDirtyBuffer[index] = StateBuffer_1.StateBuffer.CLEAN;
            this.changesBuffer[i] = 0;
        }
        this.controlBuffer[StateBuffer_1.StateBuffer.NO_OF_DIRTY_OBJECTS_INDEX] = 0;
        this.releaseLock();
        return changes;
    };
    StateBufferForSlave.prototype.getArray = function () {
        return this.objects;
    };
    StateBufferForSlave.prototype.get = function (index) {
        return this.objects[index];
    };
    return StateBufferForSlave;
}(StateBuffer_1.StateBuffer));
exports.StateBufferForSlave = StateBufferForSlave;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVCdWZmZXJGb3JTbGF2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvU3RhdGVCdWZmZXJGb3JTbGF2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQTBDO0FBTzFDO0lBQTRDLHVDQUFXO0lBS25ELDZCQUFZLE9BQTBCLEVBQUUsU0FBMkM7UUFBbkYsWUFDSSxrQkFBTSxPQUFPLENBQUMsU0FFakI7UUFMZ0IsYUFBTyxHQUFRLEVBQUUsQ0FBQztRQUkvQixLQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7SUFDL0IsQ0FBQztJQUVNLGtDQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMxRDtRQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sa0NBQUksR0FBWDtRQUNJLElBQU0sT0FBTyxHQUFrQztZQUMzQyxPQUFPLEVBQUUsRUFBRTtZQUNYLE9BQU8sRUFBRSxFQUFFO1NBQ2QsQ0FBQTtRQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUV0RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDN0MsSUFBSSxPQUFPLEdBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUN0RSxJQUFJLE9BQU8sRUFBRTtnQkFDVCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztpQkFBTSxJQUFJLFFBQVEsRUFBRTtnQkFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEM7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLHlCQUFXLENBQUMsS0FBSyxDQUFDO1lBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBVyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sc0NBQVEsR0FBZjtRQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRU0saUNBQUcsR0FBVixVQUFXLEtBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDTCwwQkFBQztBQUFELENBQUMsQUExREQsQ0FBNEMseUJBQVcsR0EwRHREO0FBMURZLGtEQUFtQiJ9