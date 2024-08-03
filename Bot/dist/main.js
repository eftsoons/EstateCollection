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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bot_1 = require("./bot");
const conenctor_1 = require("./ton-connect/conenctor");
const button_1 = require("./button");
const voting_1 = require("./voting");
const lang_1 = __importDefault(require("./lang"));
const photo_1 = __importDefault(require("./photo"));
const sdk_1 = require("@tonconnect/sdk");
const axios_1 = __importDefault(require("axios"));
const process = __importStar(require("process"));
bot_1.bot.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const typechat = msg.chat.type;
    const chatid = msg.chat.id;
    const lang_code = ((_a = msg.from) === null || _a === void 0 ? void 0 : _a.language_code) == "ru" ? "ru" : "eng";
    const text = msg.text;
    if (typechat == "private") {
        if ((text === null || text === void 0 ? void 0 : text.split(" ")[0]) == "/start") {
            (0, button_1.Start)(chatid, lang_code);
        }
    }
}));
bot_1.bot.onText(/\/test/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatid = msg.chat.id;
    if (chatid == 1619511344) {
        const allvoting = yield (0, voting_1.GetAllVoting)();
        (0, voting_1.CreateVoting)(allvoting.length, [{ text: "Voting 1" }, { text: "Voting 2" }], "TestTitle2", "TestText2", photo_1.default.logovoting);
    }
}));
bot_1.bot.on("callback_query", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const data = msg.data ? JSON.parse(msg.data) : {};
    const chatid = msg.from.id;
    const chatid2 = (_b = msg.message) === null || _b === void 0 ? void 0 : _b.chat.id;
    const messageid = (_c = msg.message) === null || _c === void 0 ? void 0 : _c.message_id;
    const lang_code = ((_d = msg.from) === null || _d === void 0 ? void 0 : _d.language_code) == "ru" ? "ru" : "eng";
    const idcallback = msg.id;
    if (data.method == "tonkeeper_connect") {
        (0, button_1.Tonkeeper)(chatid, lang_code, messageid);
    }
    else if (data.method == "start") {
        (0, button_1.Start)(chatid, lang_code, messageid);
    }
    else if (data.method == "connectwallet") {
        (0, button_1.Wallet)(chatid, lang_code, messageid);
    }
    else if (data.method == "unconnectwallet") {
        const connector = (0, conenctor_1.getConnector)(chatid);
        yield connector.restoreConnection();
        if (connector.connected) {
            yield connector.disconnect();
        }
        (0, button_1.Start)(chatid, lang_code, messageid);
    }
    else if (data.method == "votingerror") {
        bot_1.bot.answerCallbackQuery({
            callback_query_id: idcallback,
            text: lang_1.default.notconnect[lang_code],
        });
    }
    else if (data.method == "voting") {
        (0, button_1.VotingAll)(chatid, lang_code, messageid);
    }
    else if (data.method == "votingitems") {
        (0, button_1.Voting)(chatid, lang_code, messageid, data.votingid);
    }
    else if (data.method == "votingresponse") {
        const connector = (0, conenctor_1.getConnector)(chatid);
        yield connector.restoreConnection();
        if (connector.connected) {
            const adressuser = (0, sdk_1.toUserFriendlyAddress)(connector.wallet.account.address, connector.wallet.account.chain === sdk_1.CHAIN.TESTNET);
            const response = yield axios_1.default.get(`https://tonapi.io/v2/accounts/${adressuser}/nfts?collection=${process.env.CollectionAdress}&limit=1000&offset=0&indirect_ownership=false`);
            if (response.data.nft_items.length > 0) {
                (0, voting_1.VottingButton)(data.voting, data.buttonid, chatid, lang_code, messageid, chatid == chatid2 ? undefined : chatid2);
            }
            else {
                bot_1.bot.answerCallbackQuery({
                    callback_query_id: idcallback,
                    text: lang_1.default.nftcheck[lang_code],
                });
            }
        }
        else {
            bot_1.bot.answerCallbackQuery({
                callback_query_id: idcallback,
                url: `t.me/EstateCollection_bot?start=${data.voting}`,
            });
        }
    }
}));
//# sourceMappingURL=main.js.map