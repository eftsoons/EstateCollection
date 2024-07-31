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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonConnectStorage = void 0;
const storage = new Map(); // temporary storage implementation. We will replace it with the redis later
class TonConnectStorage {
    constructor(chatId) {
        this.chatId = chatId;
    } // we need to have different stores for different users
    getKey(key) {
        return this.chatId.toString() + key; // we will simply have different keys prefixes for different users
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            storage.delete(this.getKey(key));
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            storage.set(this.getKey(key), value);
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return storage.get(this.getKey(key)) || null;
        });
    }
}
exports.TonConnectStorage = TonConnectStorage;
//# sourceMappingURL=storage.js.map