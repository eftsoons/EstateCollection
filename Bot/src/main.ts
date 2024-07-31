import dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";
import { getWalletInfo, getWallets } from "./ton-connect/wallets";
import QRCode from "qrcode";
import { getConnector } from "./ton-connect/conenctor";
import {
  encodeTelegramUrlParameters,
  isTelegramUrl,
  WalletInfoRemote,
} from "@tonconnect/sdk";

const AT_WALLET_APP_NAME = "telegram-wallet";

bot.onText(/\/connect/, async (msg) => {
  const chatId = msg.chat.id;
  const wallets = await getWallets();

  const connector = getConnector(chatId);

  connector.onStatusChange(async (wallet) => {
    if (wallet) {
      const walletName =
        (await getWalletInfo(wallet.device.appName))?.name ||
        wallet.device.appName;
      bot.sendMessage(chatId, `${walletName} wallet connected!`);
    }
  });

  const link = connector.connect(wallets);
  const image = await QRCode.toBuffer(link);

  const atWallet = wallets.find(
    (wallet) => wallet.appName.toLowerCase() === AT_WALLET_APP_NAME
  );

  const atWalletLink = atWallet
    ? addTGReturnStrategy(
        convertDeeplinkToUniversalLink(link, atWallet?.universalLink),
        process.env.TELEGRAM_BOT_LINK!
      )
    : undefined;

  console.log(atWalletLink);

  bot.sendPhoto(chatId, image, {
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
            url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
              link
            )}`,
          },
        ],
      ],
    },
  });
});

bot.onText(/\/test/, (msg) => {
  bot.sendMessage(-1002193156068, "test", {
    reply_markup: {
      inline_keyboard: [[{ text: "test", url: "tg://user?id=1619511344" }]],
    },
  });
});

bot.on("callback_query", (msg) => {
  console.log(msg);
});

function addTGReturnStrategy(link: string, strategy: string): string {
  const parsed = new URL(link);
  parsed.searchParams.append("ret", strategy);
  link = parsed.toString();

  const lastParam = link.slice(link.lastIndexOf("&") + 1);
  return (
    link.slice(0, link.lastIndexOf("&")) +
    "-" +
    encodeTelegramUrlParameters(lastParam)
  );
}

function convertDeeplinkToUniversalLink(
  link: string,
  walletUniversalLink: string
): string {
  const search = new URL(link).search;
  const url = new URL(walletUniversalLink);

  if (isTelegramUrl(walletUniversalLink)) {
    const startattach =
      "tonconnect-" + encodeTelegramUrlParameters(search.slice(1));
    url.searchParams.append("startattach", startattach);
  } else {
    url.search = search;
  }

  return url.toString();
}
