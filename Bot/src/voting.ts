import { createConnection } from "mysql";
import * as process from "process";
import { Voting } from "./button";
import { bot } from "./bot";

const hostsql = process.env.HOST_SQL;
const portsql = Number(process.env.PORT_SQL);
const usersql = process.env.USER_SQL;
const databasesql = process.env.DataBase_SQL;
const paswworldsql = process.env.Passworld_SQL;

export const GetAllVoting = async () => {
  const connection = createConnection({
    host: hostsql,
    port: portsql,
    user: usersql,
    database: databasesql,
    password: paswworldsql,
  });

  const response = (await new Promise((resolve) => {
    connection.query(`SELECT id, title FROM voting`, (_, result) => {
      resolve(result);
    });
  })) as any;

  connection.end();

  return response;
};

export const GetVoting = async (id: number) => {
  const connection = createConnection({
    host: hostsql,
    port: portsql,
    user: usersql,
    database: databasesql,
    password: paswworldsql,
  });

  const response = (await new Promise((resolve) => {
    connection.query(
      `SELECT text, photo, button, userselect FROM voting WHERE id = ${id}`,
      (_, result) => {
        resolve(result[0]);
      }
    );
  })) as any;

  connection.end();

  return response;
};

export const VottingButton = async (
  votingid: number,
  buttonid: number,
  chatid: number,
  lang_code: "ru" | "eng",
  messageid: number | undefined,
  chatid2: number | undefined
) => {
  const connection = createConnection({
    host: hostsql,
    port: portsql,
    user: usersql,
    database: databasesql,
    password: paswworldsql,
  });

  const datavoting = await GetVoting(votingid);

  const userselect = JSON.parse(datavoting.userselect);

  const index = userselect.findIndex(
    (data: { user: number; button: number }) => data.user == chatid
  );

  if (index == -1) {
    userselect.push({ user: chatid, button: buttonid });
  } else {
    if (userselect[index].button == buttonid) {
      userselect.splice(index, 1);
    } else {
      userselect.splice(index, 1, { user: chatid, button: buttonid });
    }
  }

  connection.query(
    `UPDATE voting SET userselect='${JSON.stringify(
      userselect
    )}' WHERE id=${votingid}`,
    () => {
      Voting(chatid, lang_code, messageid, votingid, chatid2);
    }
  );

  connection.end();
};

export const CreateVoting = async (
  votingid: number,
  button: Array<{ text: string }>,
  title: string,
  text: string,
  photo: string
) => {
  const connection = createConnection({
    host: hostsql,
    port: portsql,
    user: usersql,
    database: databasesql,
    password: paswworldsql,
  });

  connection.query(
    `INSERT INTO voting(title, text, photo, button, userselect) VALUES ('${title}','${text}','${photo}','${JSON.stringify(
      button
    )}','[]')`
  );

  connection.end();

  const buttonmessage = button.map((data, index) => {
    return [
      {
        text: data.text,
        callback_data: JSON.stringify({
          method: "votingresponse",
          voting: votingid + 1,
          buttonid: index,
        }),
      },
    ];
  });

  bot.sendPhoto(-1002193156068, photo, {
    caption: text,
    reply_markup: {
      inline_keyboard: buttonmessage,
    },
  });
};
