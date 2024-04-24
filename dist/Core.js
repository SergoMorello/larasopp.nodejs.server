"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("./Config"));
const Log_1 = __importDefault(require("./Log"));
class Core {
    constructor() {
        this.config = new Config_1.default();
        this.log = new Log_1.default(this.config);
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map