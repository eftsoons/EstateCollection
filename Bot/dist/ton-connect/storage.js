"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonConnectStorage = void 0;
const mysql_1 = require("mysql");
const process = __importStar(require("process"));
const hostsql = process.env.HOST_SQL;
const portsql = Number(process.env.PORT_SQL);
const usersql = process.env.USER_SQL;
const databasesql = process.env.DataBase_SQL;
const paswworldsql = process.env.Passworld_SQL;
class TonConnectStorage {
    constructor(chatId) {
        this.chatId = chatId;
    }
    getKey(key) {
        return this.chatId.toString() + key;
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = (0, mysql_1.createConnection)({
                host: hostsql,
                port: portsql,
                user: usersql,
                database: databasesql,
                password: paswworldsql,
            });
            connection.query(`DELETE FROM user WHERE keyvalue = "${this.getKey(key)}"`);
            connection.end();
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = (0, mysql_1.createConnection)({
                host: hostsql,
                port: portsql,
                user: usersql,
                database: databasesql,
                password: paswworldsql,
            });
            const response = (yield new Promise((resolve) => {
                connection.query(`SELECT value FROM user WHERE keyvalue = "${this.getKey(key)}"`, (_, result) => {
                    resolve(result[0]);
                });
            }));
            const response2 = (yield new Promise((resolve) => {
                connection.query(`SELECT value FROM user`, (_, result) => {
                    resolve(result);
                });
            }));
            const valutabl = JSON.parse(value);
            const index = response2.findIndex((data) => {
                const data2obj = JSON.parse(data.value);
                return (data2obj.connectEvent &&
                    valutabl.connectEvent &&
                    data2obj.connectEvent.payload.items[0].address ===
                        valutabl.connectEvent.payload.items[0].address);
            });
            if (index == -1) {
                if (response) {
                    connection.query(`UPDATE user SET value='${value}' WHERE keyvalue = "${this.getKey(key)}"`);
                }
                else {
                    connection.query(`INSERT INTO user (keyvalue, value) VALUES ("${this.getKey(key)}", '${value}')`);
                }
            }
            connection.end();
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = (0, mysql_1.createConnection)({
                host: hostsql,
                port: portsql,
                user: usersql,
                database: databasesql,
                password: paswworldsql,
            });
            const response = (yield new Promise((resolve) => {
                connection.query(`SELECT value FROM user WHERE keyvalue = "${this.getKey(key)}"`, (_, result) => {
                    resolve(result[0]);
                });
            }));
            connection.end();
            return (response === null || response === void 0 ? void 0 : response.value) || null;
        });
    }
}
exports.TonConnectStorage = TonConnectStorage;
//# sourceMappingURL=storage.js.map