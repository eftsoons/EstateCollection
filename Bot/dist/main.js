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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bot_1 = require("./bot");
const wallets_1 = require("./ton-connect/wallets");
const qrcode_1 = __importDefault(require("qrcode"));
const conenctor_1 = require("./ton-connect/conenctor");
const sdk_1 = require("@tonconnect/sdk");
const AT_WALLET_APP_NAME = "telegram-wallet";
bot_1.bot.onText(/\/start/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const typechat = msg.chat.type;
    const chatid = msg.chat.id;
    if (typechat == "private") {
        bot_1.bot.sendMessage(chatid, "test", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Голосования", callback_data: "test" }],
                    [{ text: "Подключение кошелька", callback_data: "test2" }],
                ],
            },
        });
    }
}));
bot_1.bot.onText(/\/connect/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const wallets = yield (0, wallets_1.getWallets)();
    const connector = (0, conenctor_1.getConnector)(chatId);
    connector.onStatusChange((wallet) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (wallet) {
            const walletName = ((_a = (yield (0, wallets_1.getWalletInfo)(wallet.device.appName))) === null || _a === void 0 ? void 0 : _a.name) ||
                wallet.device.appName;
            bot_1.bot.sendMessage(chatId, `${walletName} wallet connected!`);
        }
    }));
    const link = connector.connect(wallets);
    const image = yield qrcode_1.default.toBuffer(link);
    const atWallet = wallets.find((wallet) => wallet.appName.toLowerCase() === AT_WALLET_APP_NAME);
    const atWalletLink = atWallet
        ? addTGReturnStrategy(convertDeeplinkToUniversalLink(link, atWallet === null || atWallet === void 0 ? void 0 : atWallet.universalLink), process.env.TELEGRAM_BOT_LINK)
        : undefined;
    console.log(atWalletLink);
    bot_1.bot.sendPhoto(chatId, image, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "@wallet",
                        url: atWalletLink,
                    },
                    {
                        text: "Choose a Wallet",
                        callback_data: JSON.stringify({ method: "chose_wallet" }),
                    },
                    {
                        text: "Open Link",
                        url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(link)}`,
                    },
                ],
            ],
        },
    });
}));
bot_1.bot.onText(/\/test/, (msg) => {
    bot_1.bot.sendMessage(-1002193156068, "test", {
        reply_markup: {
            inline_keyboard: [[{ text: "Voting", url: "tg://user?id=1619511344" }]],
        },
    });
});
bot_1.bot.on("callback_query", (msg) => {
    console.log(msg);
});
function addTGReturnStrategy(link, strategy) {
    const parsed = new URL(link);
    parsed.searchParams.append("ret", strategy);
    link = parsed.toString();
    const lastParam = link.slice(link.lastIndexOf("&") + 1);
    return (link.slice(0, link.lastIndexOf("&")) +
        "-" +
        (0, sdk_1.encodeTelegramUrlParameters)(lastParam));
}
function convertDeeplinkToUniversalLink(link, walletUniversalLink) {
    const search = new URL(link).search;
    const url = new URL(walletUniversalLink);
    if ((0, sdk_1.isTelegramUrl)(walletUniversalLink)) {
        const startattach = "tonconnect-" + (0, sdk_1.encodeTelegramUrlParameters)(search.slice(1));
        url.searchParams.append("startattach", startattach);
    }
    else {
        url.search = search;
    }
    return url.toString();
}
//# sourceMappingURL=main.js.map