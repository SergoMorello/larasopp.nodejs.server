"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Http {
    constructor(config) {
        this.config = config;
    }
    request(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield axios_1.default.post(this.config.appHost + '/broadcasting/' + path, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Socket-ID': this.config.token,
                        'Authorization': 'Bearer ' + this.token
                    }
                });
                return result.data;
            }
            catch (e) { }
        });
    }
    trigger(channel, event, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('trigger', {
                channel,
                event,
                message
            });
        });
    }
    check(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return (_b = (_a = (yield this.request('auth', {
                channel,
                token: this.config.token
            }))) === null || _a === void 0 ? void 0 : _a.success) !== null && _b !== void 0 ? _b : false;
        });
    }
    setToken(token) {
        this.token = token;
    }
}
exports.default = Http;
