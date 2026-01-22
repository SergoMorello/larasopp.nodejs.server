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
const Core_1 = __importDefault(require("./Core"));
class Http extends Core_1.default {
    constructor(socketId) {
        super();
        this.socketId = socketId;
    }
    request(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            data['socket_id'] = this.socketId;
            this.log.debug('HTTP request');
            this.log.debug('HTTP path: ' + path);
            this.log.debug('HTTP data: ' + JSON.stringify(data));
            try {
                const result = yield axios_1.default.post(`${this.config.appHost}/broadcasting/${path}`, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Socket-ID': this.socketId,
                        'Controll-Key': this.config.key,
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                this.log.debug(`HTTP response: ${JSON.stringify(result.data)}`);
                return result.data;
            }
            catch (e) {
                this.log.debug(`HTTP error: ${JSON.stringify(e)}`);
            }
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
    userAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.request('connect', {}));
            }
            catch (e) { }
        });
    }
    auth(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.request('auth', {
                channel
            }));
        });
    }
    setToken(token) {
        this.token = token;
    }
}
exports.default = Http;
//# sourceMappingURL=Http.js.map