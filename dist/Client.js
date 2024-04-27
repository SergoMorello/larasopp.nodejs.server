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
const Http_1 = __importDefault(require("./Http"));
const uuid_1 = require("uuid");
const Core_1 = __importDefault(require("./Core"));
class Client extends Core_1.default {
    constructor(ws) {
        super();
        this.ws = ws;
        this.presenceChannels = {};
        this.socketId = (0, uuid_1.v4)();
        this.http = new Http_1.default(this.socketId);
        this.send({
            socket_id: this.socketId
        });
    }
    send(message) {
        try {
            const sendMessage = typeof message === 'string' ? message : JSON.stringify(message);
            this.log.debug('WS message: ' + sendMessage);
            this.ws.send(sendMessage);
        }
        catch (e) { }
    }
    setToken(token) {
        this.http.setToken(token);
    }
    getPresenceChannelData(channel) {
        return this.presenceChannels[channel];
    }
    getPresenceChannels() {
        return Object.entries(this.presenceChannels);
    }
    trigger(channel, event, message, access = 'public') {
        if (access !== 'private') {
            this.send({
                channel,
                event,
                message
            });
        }
        if (access === 'public' || access === 'private') {
            this.http.trigger(channel, event, message);
        }
    }
    auth(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.http.auth(channel);
            this.presenceChannels[channel] = result;
            return result ? true : false;
        });
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map