import type { Address } from "viem";
import { z } from "zod";
import { db } from "../database";
import type { AccountSearchOptions, NewAccount } from "../types";

export class AccountsRepository {
  private static allColumns = [
    "accounts.address",
    "accounts.chainId",
    "accounts.label",
    "accounts.nameTag",
  ] as const;
  public static selectAllAccounts() {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .orderBy("accounts.chainId asc")
      .orderBy("accounts.label asc")
      .execute();
  }
  public static selectAccountsByLabel(label: string) {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .where("label", "=", label)
      .execute();
  }
  public static selectAccountsByObj(
    accountSearchOptions: AccountSearchOptions,
  ) {
    let query = db.selectFrom("accounts").select(this.allColumns);
    for (const [key, value] of Object.entries(accountSearchOptions)) {
      const verifiedKey = key as `address` | `chainId` | `label` | `nameTag`;
      if (this.allColumns.includes(`accounts.${verifiedKey}`) && value) {
        if (key === "nameTag") {
          query = query.where("nameTag", "like", `%${value}%`);
        } else {
          query = query.where(verifiedKey, "=", value.toLowerCase());
        }
      }
    }
    return query.execute();
  }

  public static selectAccountsByAddress(address: Address) {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .where("address", "=", address.toLowerCase() as Address)
      .execute();
  }
  public static selectAllLabels = async () => {
    const allRows = await db
      .selectFrom("accounts")
      .select(["label"])
      .distinct()
      .orderBy("label")
      .execute();
    return allRows.map((row) => row.label);
  };

  public static insertAccount(newAccount: NewAccount) {
    return db.insertInto("accounts").values(newAccount).execute();
  }

  public static async computeLastModifiedDate(chainId: number) {
    const result = await db
      .selectFrom("tokens")
      .select(({ fn }) => [fn.max("updated_at").as("latest_updated_at")])
      .where("chainId", "=", chainId)
      .executeTakeFirst();

    return z.string().parse(result?.latest_updated_at);
  }

  /**
   * Multi-insert accounts
   */
  public static async insertAccounts(newAccounts: Array<NewAccount>) {
    const MAX_ROW_INSERT_LENGTH = 1_000;
    let remainingRows = newAccounts;
    do {
      const rowsToInsert = remainingRows.slice(0, MAX_ROW_INSERT_LENGTH);
      remainingRows = remainingRows.slice(MAX_ROW_INSERT_LENGTH);
      await db
        .insertInto("accounts")
        .values(rowsToInsert)
        .onConflict((oc) =>
          oc
            .column("chainId")
            .column("address")
            .column("nameTag")
            .column("label")
            .doNothing(),
        )
        .execute();
    } while (remainingRows.length > 0);
  }
}
