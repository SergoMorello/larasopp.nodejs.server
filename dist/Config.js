"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Config {
    constructor() {
        this.configFile = 'larasopp-server.json';
        this.config = {
            appHost: 'http://127.0.0.1:8000',
            key: '',
            port: 3001,
            debug: false,
            log: false,
            logPath: './'
        };
        this.readConfig();
    }
    readConfig() {
        try {
            this.config = JSON.parse(fs_1.default.readFileSync(this.configFile, 'utf-8'));
        }
        catch (e) { }
    }
    get appHost() {
        return this.config.appHost;
    }
    get host() {
        return this.config.host;
    }
    get port() {
        return this.config.port;
    }
    get key() {
        return this.config.key;
    }
    get debug() {
        return this.config.debug;
    }
    get log() {
        return this.config.log;
    }
    get logPath() {
        return this.config.logPath;
    }
    getConfig() {
        return this.config;
    }
}
exports.default = Config;
//# sourceMappingURL=Config.js.map