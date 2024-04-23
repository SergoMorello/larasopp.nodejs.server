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
const Client_1 = __importDefault(require("./Client"));
const Config_1 = __importDefault(require("./Config"));
class Server {
    constructor() {
        this.channels = {};
        this.config = new Config_1.default();
        this.wss = new ws_1.default.Server({
            port: this.config.port,
            host: this.config.host
        });
        this.run();
    }
    run() {
        var _a;
        console.log('Larasopp Server');
        console.log('Host: ' + ((_a = this.config.host) !== null && _a !== void 0 ? _a : '0.0.0.0'));
        console.log('Port: ' + this.config.port);
        console.log('Api Host: ' + this.config.appHost);
        this.wss.on('listening', () => {
            console.info('listening...');
        });
        this.wss.on('connection', (ws, request) => {
            var _a, _b, _c, _d;
            const client = new Client_1.default(ws, this.config);
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
            const token = (_d = new URLSearchParams((_c = request.url) !== null && _c !== void 0 ? _c : '').get('/token')) === null || _d === void 0 ? void 0 : _d.toString();
            if (token) {
                client.setToken(token);
            }
            console.log('join ' + client.socketId);
            ws.on('close', () => {
                console.log('leave ' + client.socketId);
                Object.keys(this.channels).forEach((channel) => {
                    this.unsubscribe(channel, client);
                });
            });
            ws.on('message', (val) => {
                const message = val.toString();
                const data = JSON.parse(message);
                if (data.token)
                    client.setToken(data.token);
                if (data.subscribe)
                    this.subscribe(data.subscribe, client);
                if (data.unsubscribe)
                    this.unsubscribe(data.unsubscribe, client);
                if (data.channel && data.event && data.message && data.type)
                    this.message(data.channel, data.event, message, data.type, client);
            });
        });
    }
    subscribe(channel, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield client.check(channel)))
                return;
            if (!this.channels[channel]) {
                this.channels[channel] = [];
            }
            if (!this.hasChannelClient(channel, client)) {
                this.channels[channel].push(client);
            }
        });
    }
    unsubscribe(channel, client) {
        if (this.channels[channel]) {
            this.channels[channel] = this.channels[channel].filter((currentClient) => currentClient !== client);
        }
    }
    message(channel, event, message, access, client) {
        if (this.channels[channel] && this.hasChannelClient(channel, client)) {
            if (access === 'public' || access === 'protected') {
                this.channels[channel].forEach((client) => {
                    client.send(message);
                });
            }
            if (access === 'public' || access === 'private') {
                const data = JSON.parse(message);
                client.trigger(channel, event, data.message);
            }
        }
    }
    hasChannelClient(channel, client) {
        return this.channels[channel].includes(client);
    }
}
;
exports.default = Server;
//# sourceMappingURL=Server.js.map