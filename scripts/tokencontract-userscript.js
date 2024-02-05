// ==UserScript==
// @name         token-contract
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       icepy
// @match        https://etherscan.io/accounts/label/token-contract?subcatid=undefined&size=100&start=0&col=1&order=asc
// @icon         https://www.google.com/s2/favicons?sz=64&domain=etherscan.io
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  alert(`Starting Etherscan userscripts for tag "token-contract"`);

  let draw = 1;
  const pages = 116;

  const length = 100;

  const payload = {
    labelModel: {
      label: "token-contract",
    },
    dataTableModel: {
      draw,
      length,
      start: 0,
      search: {
        value: "",
        regex: false,
      },
      order: [
        {
          column: 1,
          dir: "asc",
        },
      ],
      columns: [
        {
          data: "address",
          name: "",
          searchable: true,
          orderable: false,
          search: { value: "", regex: false },
        },
        {
          data: "nameTag",
          name: "",
          searchable: true,
          orderable: false,
          search: { value: "", regex: false },
        },
      ],
    },
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function run() {
    const values = [];
    const hacks = [];
    const csv = [["address", "nameTag"]];

    for (let index = 1; index <= pages; index++) {
      console.log(`Fetching page ${index} of ${pages}`);
      payload.dataTableModel.draw = draw++;
      payload.dataTableModel.start = (index - 1) * length;
      const response = await fetch(
        "https://etherscan.io/accounts.aspx/GetTableEntriesBySubLabel",
        {
          method: "POST",
          headers: [["Content-Type", "application/json; charset=utf-8"]],
          body: JSON.stringify(payload),
        },
      );
      const json = await response.json();
      const data = json.d.data;
      const newData = data.map((v) => {
        return {
          address: v.address.replace(/<[^<>]+>/g, "").toLowerCase(),
          nameTag: v.nameTag,
        };
      });
      values.push(newData);
      await sleep(3000);
    }

    values.forEach((v) => {
      v.forEach((k) => {
        hacks.push(k);
        csv.push([k.address, k.nameTag]);
      });
    });

    const createCSVData = csv
      .map((v) => {
        return v.join(",");
      })
      .join("\n");

    alert(
      `Finished Etherscan userscripts for tag "token-contract". Check console for csv`,
    );
    console.log(JSON.stringify(hacks));
    console.log(createCSVData);
  }

  run();
})();
