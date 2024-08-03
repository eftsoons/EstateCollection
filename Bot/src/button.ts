import { bot } from "./bot";
import lang from "./lang";
import { getConnector } from "./ton-connect/conenctor";
import { getWalletInfo, getWallets } from "./ton-connect/wallets";
import photo from "./photo";
import { CHAIN, toUserFriendlyAddress } from "@tonconnect/sdk";
import QRCode from "qrcode";
import { addTGReturnStrategy, convertDeeplinkToUniversalLink } from "./utils";
import { GetAllVoting, GetVoting } from "./voting";

export const Start = async (
  chatid: number,
  lang_code: "ru" | "eng",
  message_id?: number
) => {
  const connector = getConnector(chatid);

  await connector.restoreConnection();

  if (!message_id) {
    bot.sendPhoto(chatid, photo.logo, {
      caption: connector.connected
        ? `${lang.connectwallet[lang_code]}: ${toUserFriendlyAddress(
            connector.wallet!.account.address,
            connector.wallet!.account.chain === CHAIN.TESTNET
          )}`
        : `${lang.notconnect[lang_code]}`,
      reply_markup: {
        inline_keyboard: [
          connector.connected
            ? [
                {
                  text: lang.voting[lang_code],
                  callback_data: JSON.stringify({
                    method: "voting",
                  }),
                },
              ]
            : [
                {
                  text: `❌ ${lang.voting[lang_code]} ❌`,
                  callback_data: JSON.stringify({
                    method: "votingerror",
                  }),
                },
              ],
          !connector.connected
            ? [
                {
                  text: lang.connect[lang_code],
                  callback_data: JSON.stringify({ method: "connectwallet" }),
                },
              ]
            : [
                {
                  text: lang.anticonnect[lang_code],
                  callback_data: JSON.stringify({
                    method: "unconnectwallet",
                  }),
                },
              ],
        ],
      },
    });
  } else {
    bot.editMessageMedia(
      {
        type: "photo",
        media: photo.logo,
        caption: connector.connected
          ? `${lang.connectwallet[lang_code]}: ${toUserFriendlyAddress(
              connector.wallet!.account.address,
              connector.wallet!.account.chain === CHAIN.TESTNET
            )}`
          : `${lang.notconnect[lang_code]}`,
      },
      {
        chat_id: chatid,
        message_id: message_id,
        reply_markup: {
          inline_keyboard: [
            connector.connected
              ? [
                  {
                    text: lang.voting[lang_code],
                    callback_data: JSON.stringify({
                      method: "voting",
                    }),
                  },
                ]
              : [
                  {
                    text: `❌ ${lang.voting[lang_code]} ❌`,
                    callback_data: JSON.stringify({
                      method: "votingerror",
                    }),
                  },
                ],
            !connector.connected
              ? [
                  {
                    text: lang.connect[lang_code],
                    callback_data: JSON.stringify({ method: "connectwallet" }),
                  },
                ]
              : [
                  {
                    text: lang.anticonnect[lang_code],
                    callback_data: JSON.stringify({
                      method: "unconnectwallet",
                    }),
                  },
                ],
          ],
        },
      }
    );
  }
};

export const Wallet = async (
  chatid: number,
  lang_code: "ru" | "eng",
  message_id: number | undefined
) => {
  const connector = getConnector(chatid);
  const wallets = await getWallets();

  connector.onStatusChange(async (wallet) => {
    if (wallet) {
      Start(chatid, lang_code, message_id);
    }
  });

  const link = connector.connect(wallets);

  const atWallet = wallets.find(
    (wallet) => wallet.appName.toLowerCase() === "telegram-wallet"
  );

  const atWalletLink = atWallet
    ? addTGReturnStrategy(
        convertDeeplinkToUniversalLink(link, atWallet?.universalLink),
        process.env.TELEGRAM_BOT_LINK!
      )
    : undefined;

  bot.editMessageMedia(
    { type: "photo", media: photo.logoconnect },
    {
      chat_id: chatid,
      message_id: message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${lang.login[lang_code]} @wallet`,
              url: atWalletLink,
            },
          ],
          [
            {
              text: `${lang.login[lang_code]} Tonkeeper`,
              callback_data: JSON.stringify({ method: "tonkeeper_connect" }),
            },
          ],
          [
            {
              text: lang.back[lang_code],
              callback_data: JSON.stringify({ method: "start" }),
            },
          ],
        ],
      },
    }
  );
};

export const Tonkeeper = async (
  chatid: number,
  lang_code: "ru" | "eng",
  message_id: number | undefined
) => {
  const connector = getConnector(chatid);

  const selectedWallet = await getWalletInfo("tonkeeper");

  if (!selectedWallet) {
    return;
  }

  let buttonLink = connector.connect({
    bridgeUrl: selectedWallet.bridgeUrl,
    universalLink: selectedWallet.universalLink,
  });

  await QRCode.toFile(`./QR-code-tonkeeper.png`, buttonLink);

  connector.onStatusChange(async (wallet) => {
    if (wallet) {
      Start(chatid, lang_code, message_id);
    }
  });

  bot.editMessageMedia(
    {
      type: "photo",
      media: "attach://QR-code-tonkeeper.png",
      caption: lang.loginQR[lang_code],
    },
    {
      message_id: message_id,
      chat_id: chatid,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${lang.login[lang_code]} Tonkeeper`,
              url: buttonLink,
            },
          ],
          [
            {
              text: lang.back[lang_code],
              callback_data: JSON.stringify({ method: "connectwallet" }),
            },
          ],
        ],
      },
    }
  );
};

export const VotingAll = async (
  chatid: number,
  lang_code: "ru" | "eng",
  message_id: number | undefined
) => {
  const allvoting = await GetAllVoting();

  const button = allvoting.map((data: { id: number; title: string }) => {
    return [
      {
        text: data.title,
        callback_data: JSON.stringify({
          method: "votingitems",
          votingid: data.id,
        }),
      },
    ];
  });

  button.push([
    {
      text: lang.back[lang_code],
      callback_data: JSON.stringify({
        method: "start",
      }),
    },
  ]);

  bot.editMessageMedia(
    {
      type: "photo",
      media: photo.choosevoting,
      caption: lang.votingselect[lang_code],
    },
    {
      message_id: message_id,
      chat_id: chatid,
      reply_markup: {
        inline_keyboard: button,
      },
    }
  );
};

export const Voting = async (
  chatid: number,
  lang_code: "ru" | "eng",
  message_id: number | undefined,
  votingid: number,
  chatid2?: number | undefined
) => {
  const data = await GetVoting(votingid);
  const userselect = JSON.parse(data.userselect);

  const button = JSON.parse(data.button).map(
    (data: { text: string }, index: number) => {
      const indexuser = userselect.findIndex(
        (data: { user: number; button: number }) => data.user == chatid
      );
      const select = userselect.filter(
        (data: { user: number; button: number }) => data.button === index
      ).length;
      const percentvoting =
        userselect.length && select ? (select / userselect.length) * 100 : 0;

      return [
        {
          text:
            userselect[indexuser]?.button == index
              ? `${percentvoting}% ✅ ${data.text} ✅ ${percentvoting}%`
              : `${percentvoting}% ${data.text} ${percentvoting}%`,
          callback_data: JSON.stringify({
            method: "votingresponse",
            voting: votingid,
            buttonid: index,
          }),
        },
      ];
    }
  );

  if (!chatid2) {
    button.push([
      {
        text: lang.back[lang_code],
        callback_data: JSON.stringify({
          method: "voting",
        }),
      },
    ]);
  }

  try {
    bot
      .editMessageMedia(
        {
          type: "photo",
          media: data.photo,
          caption: data.text,
        },
        {
          message_id: message_id,
          chat_id: chatid2 ? chatid2 : chatid,
          reply_markup: {
            inline_keyboard: button,
          },
        }
      )
      .catch(() => {});
  } catch {}
};
