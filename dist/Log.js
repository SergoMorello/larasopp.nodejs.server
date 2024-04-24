"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Log {
    constructor(config) {
        this.config = config;
    }
    writeFile(message) {
        if (!this.config.log)
            return;
        try {
            fs_1.default.appendFile(this.config.logPath + 'larasopp-server.log', this.message(message) + "\n", err => {
                if (err)
                    console.error(err);
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    message(message) {
        const date = new Date();
        return date.toLocaleString() + "\t" + message;
    }
    debug(messageData) {
        if (!this.config.debug)
            return;
        const message = typeof messageData === 'string' ? messageData : JSON.stringify(messageData);
        console.debug(message);
        this.writeFile(message);
    }
    info(message) {
        console.info(message);
        this.writeFile(message);
    }
    warn(message) {
        console.warn(message);
        this.writeFile(message);
    }
    error(message) {
        console.error(message);
        this.writeFile(message);
    }
}
exports.default = Log;
//# sourceMappingURL=Log.js.map