import { IStorage } from "@tonconnect/sdk";
import { createConnection } from "mysql";
import * as process from "process";

const hostsql = process.env.HOST_SQL;
const portsql = Number(process.env.PORT_SQL);
const usersql = process.env.USER_SQL;
const databasesql = process.env.DataBase_SQL;
const paswworldsql = process.env.Passworld_SQL;

export class TonConnectStorage implements IStorage {
  constructor(private readonly chatId: number) {}

  private getKey(key: string): string {
    return this.chatId.toString() + key;
  }

  async removeItem(key: string): Promise<void> {
    const connection = createConnection({
      host: hostsql,
      port: portsql,
      user: usersql,
      database: databasesql,
      password: paswworldsql,
    });

    connection.query(`DELETE FROM user WHERE keyvalue = "${this.getKey(key)}"`);

    connection.end();
  }

  async setItem(key: string, value: string): Promise<void> {
    const connection = createConnection({
      host: hostsql,
      port: portsql,
      user: usersql,
      database: databasesql,
      password: paswworldsql,
    });

    const response = (await new Promise((resolve) => {
      connection.query(
        `SELECT value FROM user WHERE keyvalue = "${this.getKey(key)}"`,
        (_, result) => {
          resolve(result[0]);
        }
      );
    })) as boolean;

    const response2 = (await new Promise((resolve) => {
      connection.query(`SELECT value FROM user`, (_, result) => {
        resolve(result);
      });
    })) as Array<{ value: string }>;

    const valutabl = JSON.parse(value);

    const index = response2.findIndex((data: { value: string }) => {
      const data2obj = JSON.parse(data.value);

      return (
        data2obj.connectEvent &&
        valutabl.connectEvent &&
        data2obj.connectEvent.payload.items[0].address ===
          valutabl.connectEvent.payload.items[0].address
      );
    });

    if (index == -1) {
      if (response) {
        connection.query(
          `UPDATE user SET value='${value}' WHERE keyvalue = "${this.getKey(
            key
          )}"`
        );
      } else {
        connection.query(
          `INSERT INTO user (keyvalue, value) VALUES ("${this.getKey(
            key
          )}", '${value}')`
        );
      }
    }

    connection.end();
  }

  async getItem(key: string): Promise<string | null> {
    const connection = createConnection({
      host: hostsql,
      port: portsql,
      user: usersql,
      database: databasesql,
      password: paswworldsql,
    });

    const response = (await new Promise((resolve) => {
      connection.query(
        `SELECT value FROM user WHERE keyvalue = "${this.getKey(key)}"`,
        (_, result) => {
          resolve(result[0]);
        }
      );
    })) as { value: string };

    connection.end();
    return response?.value || null;
  }
}
