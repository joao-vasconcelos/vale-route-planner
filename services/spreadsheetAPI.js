"use strict";

/* * * * * */
/* SPREADSHEET API */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const { GoogleSpreadsheet } = require("google-spreadsheet");

exports.getRows = async () => {
  const doc = new GoogleSpreadsheet(config.get("spreadsheets.document-id"));
  await doc.useServiceAccountAuth({
    client_email: config.get("secrets.google-service-account-email"),
    private_key: config
      .get("secrets.google-service-account-private-key")
      .replace(/\\n/g, "\n"), // Fix for newline in Balena Dashboard Environment Variables
  });
  await doc.loadInfo();
  const sheet = doc.sheetsById[config.get("spreadsheets.sheet-id")];
  return await sheet.getRows();
};
