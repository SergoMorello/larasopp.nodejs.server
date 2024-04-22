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
const Http_1 = __importDefault(require("./Http"));
class App {
    constructor() {
        this.channels = {};
        this.config = {
            appHost: 'http://127.0.0.1:8000',
            token: '1234',
            port: 3001,
            controllPort: 8123
        };
        this.wss = new ws_1.default.Server({
            port: this.config.port
        });
        this.http = new Http_1.default(this.config);
        this.wss.on('connection', (ws, request) => {
            var _a, _b, _c, _d;
            const controllToken = (_b = new URLSearchParams((_a = request.url) !== null && _a !== void 0 ? _a : '').get('/controll_token')) === null || _b === void 0 ? void 0 : _b.toString();
            if (controllToken === this.config.token) {
                ws.on('message', (val) => {
                    const message = val.toString();
                    const data = JSON.parse(message);
                    if (data.channel && data.event && data.message) {
                        if (this.channels[data.channel]) {
                            this.channels[data.channel].forEach((client) => {
                                client.send(message);
                            });
                        }
                    }
                });
                return;
            }
            this.token = (_d = new URLSearchParams((_c = request.url) !== null && _c !== void 0 ? _c : '').get('/token')) === null || _d === void 0 ? void 0 : _d.toString();
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
                    this.message(data.channel, data.event, message, data.type, ws);
            });
        });
    }
    subscribe(channel, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.http.check(channel)))
                return;
            if (!this.channels[channel]) {
                this.channels[channel] = [];
            }
            if (!this.hasChannelClient(channel, socket)) {
                this.channels[channel].push(socket);
            }
        });
    }
    unsubscribe(channel, socket) {
        if (this.channels[channel]) {
            this.channels[channel] = this.channels[channel].filter((client) => client !== socket);
        }
    }
    message(channel, event, message, access, socket) {
        if (this.channels[channel] && this.hasChannelClient(channel, socket)) {
            if (access === 'public' || access === 'protected') {
                this.channels[channel].forEach((client) => {
                    client.send(message);
                });
            }
            if (access === 'public' || access === 'private') {
                const data = JSON.parse(message);
                this.http.trigger(channel, event, data.message);
            }
        }
    }
    hasChannelClient(channel, socket) {
        return this.channels[channel].includes(socket);
    }
}
;
exports.default = App;
