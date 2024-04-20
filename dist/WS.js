"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class WS {
    constructor({ port = 3000, host }) {
        this.wss = new ws_1.default.Server({
            port,
            host
        });
    }
}
exports.default = WS;
