import * as cheerio from "cheerio";
import type { Address } from "viem";
import type {
  AccountRow,
  AccountRows,
  TokenRow,
  TokenRows,
} from "../ChainPuller";
import { HtmlParser } from "./HtmlParser";

export class EtherscanHtmlParser extends HtmlParser {
  public constructor() {
    super();
    super.setUseApiForTokenRows(true);
  }

  public selectAllAccountAddresses(
    html: string,
    subcatId: string = "0",
  ): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-${subcatId} > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[0]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const newAddressInfo: AccountRow = {
        address: address.trim() as Address,
        nameTag: $(tableCells[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }

  public selectAllTokenAddresses(html: string): TokenRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: TokenRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[1]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const tokenNameColumn = $(tableCells[2]).text().trim();
      const regex = /^(.*)\n\s*\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      const tokenName = match?.[1];
      const tokenSymbol = match?.[2];
      const image = $(tableCells[2]).find("a > img").attr("src");
      const website = $(tableCells[5]).text().trim().toLowerCase();
      const tokenRow: TokenRow = {
        address: address.trim() as Address,
        website,
        name: tokenName || null,
        symbol: tokenSymbol || null,
        image: image || null,
      };

      addressesInfo = [...addressesInfo, tokenRow];
    });

    return addressesInfo;
  }
}
