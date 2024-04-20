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
const ws_1 = __importDefault(require("ws"));
const axios_1 = __importDefault(require("axios"));
class App {
    constructor() {
        this.channels = {};
        this.wss = new ws_1.default.Server({
            port: 3001
        });
        this.wss.on('connection', (ws, request) => {
            var _a, _b;
            this.token = (_b = new URLSearchParams((_a = request.url) !== null && _a !== void 0 ? _a : '').get('/token')) === null || _b === void 0 ? void 0 : _b.toString();
            console.log('new client');
            ws.on('close', () => {
                console.log('client leave');
                Object.keys(this.channels).forEach((channel) => {
                    this.unsubscribe(channel, ws);
                });
            });
            ws.on('message', (val) => {
                const message = val.toString();
                const data = JSON.parse(message);
                if (data.subscribe)
                    this.subscribe(data.subscribe, ws);
                if (data.unsubscribe)
                    this.unsubscribe(data.unsubscribe, ws);
                if (data.channel && data.event && data.message && data.type)
                    this.message(data.channel, message, data.type, ws);
            });
        });
    }
    authChannel(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield axios_1.default.post('http://127.0.0.1:8000/broadcasting/auth', {
                    channel
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                console.log(result.data);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    subscribe(channel, socket) {
        this.authChannel(channel);
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }
        if (!this.hasChannelClient(channel, socket)) {
            this.channels[channel].push(socket);
        }
    }
    unsubscribe(channel, socket) {
        if (this.channels[channel]) {
            this.channels[channel] = this.channels[channel].filter((client) => client !== socket);
        }
    }
    message(channel, message, access, socket) {
        if (this.channels[channel] && this.hasChannelClient(channel, socket)) {
            if (access === 'public' || access === 'protected') {
                this.channels[channel].forEach((client) => {
                    client.send(message);
                });
            }
        }
    }
    hasChannelClient(channel, socket) {
        return this.channels[channel].includes(socket);
    }
}
;
exports.default = App;
