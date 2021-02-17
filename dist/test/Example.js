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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleSlaveObjectArray = exports.ExampleMasterObjectArray = void 0;
var SharedObjectMasterArray_1 = require("../lib/SharedObjectMasterArray");
var SharedObjectSlaveArray_1 = require("../lib/SharedObjectSlaveArray");
var ExampleMasterObjectArray = /** @class */ (function (_super) {
    __extends(ExampleMasterObjectArray, _super);
    function ExampleMasterObjectArray(maxObjects) {
        var _this = _super.call(this, maxObjects) || this;
        _this.main = new Uint8Array(new SharedArrayBuffer(maxObjects * 3 * Uint8Array.BYTES_PER_ELEMENT));
        _this.sec = new Uint32Array(new SharedArrayBuffer(maxObjects * 2 * Uint32Array.BYTES_PER_ELEMENT));
        return _this;
    }
    ExampleMasterObjectArray.prototype.populateMemory = function (index, obj) {
        var pos = index * 3;
        var pos2 = index * 2;
        this.main[pos] = obj.metaId;
        this.main[pos + 1] = obj.x;
        this.main[pos + 2] = obj.y;
        this.sec[pos2] = obj.sx;
        this.sec[pos2 + 1] = obj.sy;
    };
    ExampleMasterObjectArray.prototype.deleteMemory = function (index) {
        var pos = index * 3;
        var pos2 = index * 2;
        this.main[pos] = 0;
        this.main[pos + 1] = 0;
        this.main[pos + 2] = 0;
        this.sec[pos2] = 0;
        this.sec[pos2 + 1] = 0;
    };
    ExampleMasterObjectArray.prototype.export = function () {
        return __assign(__assign({}, _super.prototype.export.call(this)), { main: this.main.buffer, sec: this.sec.buffer });
    };
    return ExampleMasterObjectArray;
}(SharedObjectMasterArray_1.SharedObjectMasterArray));
exports.ExampleMasterObjectArray = ExampleMasterObjectArray;
var ExampleSlaveObjectArray = /** @class */ (function (_super) {
    __extends(ExampleSlaveObjectArray, _super);
    function ExampleSlaveObjectArray(buffers) {
        var _this = _super.call(this, buffers) || this;
        _this.main = new Uint8Array(buffers.main);
        _this.sec = new Uint32Array(buffers.sec);
        return _this;
    }
    ExampleSlaveObjectArray.prototype.updateObject = function (index, obj) {
        if (!obj) {
            obj = {};
        }
        if (this.main[index * 3] === 0) {
            return null;
        }
        var pos = index * 3;
        var pos2 = index * 2;
        obj.metaId = this.main[pos];
        obj.x = this.main[pos + 1];
        obj.y = this.main[pos + 2];
        obj.sx = this.sec[pos2];
        obj.sy = this.sec[pos2 + 1];
        return obj;
    };
    return ExampleSlaveObjectArray;
}(SharedObjectSlaveArray_1.SharedObjectSlaveArray));
exports.ExampleSlaveObjectArray = ExampleSlaveObjectArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L0V4YW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEVBQXVFO0FBQ3ZFLHdFQUFxRTtBQUdyRTtJQUE4Qyw0Q0FBcUM7SUFLL0Usa0NBQW9CLFVBQWtCO1FBQXRDLFlBQ0ksa0JBQU0sVUFBVSxDQUFDLFNBR3BCO1FBRkcsS0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNqRyxLQUFJLENBQUMsR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksaUJBQWlCLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDOztJQUN0RyxDQUFDO0lBRVMsaURBQWMsR0FBeEIsVUFBeUIsS0FBYSxFQUFFLEdBQWlCO1FBQ3JELElBQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FB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