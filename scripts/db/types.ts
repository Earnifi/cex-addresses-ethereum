import type { Generated, Insertable, Selectable, Updateable } from "kysely";
import { TokenDBRow } from "../../api/load-all-tokens-from-filesystem";

export interface Database {
  accounts: AccountsTable;
  tokens: TokensTable;
}

interface AccountsTable {
  // Columns that are generated by the database should be marked
  // using the `Generated` type. This way they are automatically
  // made optional in inserts and updates.
  id: Generated<number>;

  chainId: number;
  address: string;
  label: string;
  nameTag: string | null;
}

// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
//
// Most of the time you should trust the type inference and not use explicit
// types at all. These types can be useful when typing function arguments.
export type Account = Selectable<AccountsTable>;
export type NewAccount = Insertable<AccountsTable>;
export type AccountUpdate = Updateable<AccountsTable>;

type TokensTable = { id: Generated<number> } & TokenDBRow;

export type NewToken = Insertable<TokensTable>;
