"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedObjectSlaveArray = void 0;
var StateBufferForSlave_1 = require("./StateBufferForSlave");
var SharedObjectSlaveArray = /** @class */ (function () {
    function SharedObjectSlaveArray(buffers) {
        var _this = this;
        this.stateBuffer = new StateBufferForSlave_1.StateBufferForSlave(buffers, {
            updateObject: function (index, obj) {
                return _this.updateObject(index, obj);
            }
        });
    }
    SharedObjectSlaveArray.prototype.init = function () {
        this.stateBuffer.init();
        return this;
    };
    SharedObjectSlaveArray.prototype.sync = function () {
        return this.stateBuffer.sync();
    };
    SharedObjectSlaveArray.prototype.getArray = function () {
        return this.stateBuffer.getArray();
    };
    SharedObjectSlaveArray.prototype.get = function (index) {
        return this.stateBuffer.get(index);
    };
    return SharedObjectSlaveArray;
}());
exports.SharedObjectSlaveArray = SharedObjectSlaveArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcmVkT2JqZWN0U2xhdmVBcnJheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvU2hhcmVkT2JqZWN0U2xhdmVBcnJheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBc0Y7QUFHdEY7SUFJSSxnQ0FBc0IsT0FBMEI7UUFBaEQsaUJBTUM7UUFMRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkseUNBQW1CLENBQUMsT0FBTyxFQUFFO1lBQ2hELFlBQVksRUFBRSxVQUFDLEtBQUssRUFBRSxHQUFHO2dCQUNyQixPQUFPLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBSU0scUNBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLHFDQUFJLEdBQVg7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVNLHlDQUFRLEdBQWY7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVNLG9DQUFHLEdBQVYsVUFBVyxLQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNMLDZCQUFDO0FBQUQsQ0FBQyxBQTlCRCxJQThCQztBQTlCcUIsd0RBQXNCIn0=