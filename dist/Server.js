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
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const Core_1 = __importDefault(require("./Core"));
const Client_1 = __importDefault(require("./Client"));
const Channels_1 = __importDefault(require("./Channels"));
class Server extends Core_1.default {
    constructor() {
        super();
        if (this.config.ssl) {
            const server = https_1.default.createServer({
                cert: this.config.ssl.cert ? fs_1.default.readFileSync(this.config.ssl.cert) : undefined,
                key: this.config.ssl.key ? fs_1.default.readFileSync(this.config.ssl.key) : undefined,
                ca: this.config.ssl.ca ? fs_1.default.readFileSync(this.config.ssl.ca) : undefined
            });
            this.wss = new ws_1.default.Server({
                host: this.config.host,
                server
            });
            server.listen(this.config.port);
        }
        else {
            this.wss = new ws_1.default.Server({
                port: this.config.port,
                host: this.config.host
            });
        }
        this.run();
    }
    run() {
        var _a;
        this.log.info('Larasopp Server');
        this.log.info(`SSL: ${(this.config.ssl ? true : false)}`);
        this.log.info(`Host: ${((_a = this.config.host) !== null && _a !== void 0 ? _a : '0.0.0.0')}`);
        this.log.info(`Port: ${this.config.port}`);
        this.log.info(`Api Host: ${this.config.appHost}`);
        this.wss.on('listening', () => {
            this.log.info('listening...');
        });
        this.wss.on('connection', (ws, request) => {
            var _a;
            this.log.debug(`New connect`);
            this.log.debug(`ip: ${request.socket.remoteAddress}`);
            const urlParams = new URLSearchParams((_a = request.url) !== null && _a !== void 0 ? _a : '');
            const key = urlParams.get('/key');
            const token = urlParams.get('/token');
            this.connectControll(ws, key);
            this.connectClient(ws, token);
        });
    }
    connectControll(ws, key) {
        if (key)
            this.log.debug(`try entry with key: ${key}`);
        if (key === this.config.key) {
            this.log.debug(`auth key: ${key}`);
            ws.on('message', (val) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const message = val.toString();
                    this.log.debug(`command message: ${message}`);
                    const data = JSON.parse(message);
                    if (data.channel && data.event && data.message) {
                        const channel = Channels_1.default.getChannel(data.channel);
                        if (data.type === 'private') {
                            yield channel.makePrivate();
                        }
                        channel.getClients().forEach((client) => {
                            client.send(message);
                        });
                    }
                }
                catch (e) {
                    this.log.error(String(e));
                }
            }));
        }
    }
    connectClient(ws, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                return;
            const client = new Client_1.default(ws, token);
            const user = yield client.userAuth();
            if (!user) {
                client.error('auth fail');
                client.disconnect();
                this.log.debug(`client auth fail: ${client.socketId}`);
                return;
            }
            ;
            this.log.debug(`client id: ${client.socketId}`);
            ws.on('close', () => {
                this.log.debug(`Disconnected: ${client.socketId}`);
                Channels_1.default.getChannels().forEach((channel) => {
                    channel.unsubscribe(client);
                });
            });
            ws.on('message', (val) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const message = val.toString();
                    const data = JSON.parse(message);
                    this.log.debug(`client message: ${message}`);
                    if (data.token)
                        client.setToken(data.token);
                    if (data.me === true)
                        client.send({
                            channel: '__SYSTEM',
                            event: 'user',
                            message: client.getUser()
                        });
                    if (data.me === 'refresh')
                        client.send({
                            channel: '__SYSTEM',
                            event: 'user-refresh',
                            message: yield client.userAuth()
                        });
                    if (data.subscribe)
                        this.subscribe(data.subscribe, client);
                    if (data.unsubscribe)
                        this.unsubscribe(data.unsubscribe, client);
                    if (data.channel && data.event && data.message && data.type) {
                        const channel = Channels_1.default.getChannel(data.channel);
                        channel.message(data.event, data.message, data.type, client);
                    }
                }
                catch (e) {
                    this.log.error(String(e));
                }
            }));
        });
    }
    subscribe(name, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = Channels_1.default.getChannel(name);
            yield channel.subscribe(client);
        });
    }
    unsubscribe(name, client) {
        const channel = Channels_1.default.getChannel(name);
        channel.unsubscribe(client);
    }
}
;
exports.default = Server;
//# sourceMappingURL=Server.js.map