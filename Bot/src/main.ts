import dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";
import { getConnector } from "./ton-connect/conenctor";
import { Start, Tonkeeper, Wallet, VotingAll, Voting } from "./button";
import { CreateVoting, GetAllVoting, VottingButton } from "./voting";
import lang from "./lang";
import photo from "./photo";
import { CHAIN, toUserFriendlyAddress } from "@tonconnect/sdk";
import axios from "axios";
import * as process from "process";

bot.on("message", async (msg) => {
  const typechat = msg.chat.type;
  const chatid = msg.chat.id;
  const lang_code = msg.from?.language_code == "ru" ? "ru" : "eng";
  const text = msg.text;

  if (typechat == "private") {
    if (text?.split(" ")[0] == "/start") {
      Start(chatid, lang_code);
    }
  }
});

bot.onText(/\/test/, async (msg) => {
  const chatid = msg.chat.id;
  if (chatid == 1619511344) {
    const allvoting = await GetAllVoting();

    CreateVoting(
      allvoting.length,
      [{ text: "Voting 1" }, { text: "Voting 2" }],
      "TestTitle2",
      "TestText2",
      photo.logovoting
    );
  }
});

bot.on("callback_query", async (msg) => {
  const data = msg.data ? JSON.parse(msg.data) : {};
  const chatid = msg.from.id;
  const chatid2 = msg.message?.chat.id;
  const messageid = msg.message?.message_id;
  const lang_code = msg.from?.language_code == "ru" ? "ru" : "eng";
  const idcallback = msg.id;

  if (data.method == "tonkeeper_connect") {
    Tonkeeper(chatid, lang_code, messageid);
  } else if (data.method == "start") {
    Start(chatid, lang_code, messageid);
  } else if (data.method == "connectwallet") {
    Wallet(chatid, lang_code, messageid);
  } else if (data.method == "unconnectwallet") {
    const connector = getConnector(chatid);

    await connector.restoreConnection();

    if (connector.connected) {
      await connector.disconnect();
    }

    Start(chatid, lang_code, messageid);
  } else if (data.method == "votingerror") {
    bot.answerCallbackQuery({
      callback_query_id: idcallback,
      text: lang.notconnect[lang_code],
    });
  } else if (data.method == "voting") {
    VotingAll(chatid, lang_code, messageid);
  } else if (data.method == "votingitems") {
    Voting(chatid, lang_code, messageid, data.votingid);
  } else if (data.method == "votingresponse") {
    const connector = getConnector(chatid);

    await connector.restoreConnection();

    if (connector.connected) {
      const adressuser = toUserFriendlyAddress(
        connector.wallet!.account.address,
        connector.wallet!.account.chain === CHAIN.TESTNET
      );

      const response = await axios.get(
        `https://tonapi.io/v2/accounts/${adressuser}/nfts?collection=${process.env.CollectionAdress}&limit=1000&offset=0&indirect_ownership=false`
      );

      if (response.data.nft_items.length > 0) {
        VottingButton(
          data.voting,
          data.buttonid,
          chatid,
          lang_code,
          messageid,
          chatid == chatid2 ? undefined : chatid2
        );
      } else {
        bot.answerCallbackQuery({
          callback_query_id: idcallback,
          text: lang.nftcheck[lang_code],
        });
      }
    } else {
      bot.answerCallbackQuery({
        callback_query_id: idcallback,
        url: `t.me/EstateCollection_bot?start=${data.voting}`,
      });
    }
  }
});
