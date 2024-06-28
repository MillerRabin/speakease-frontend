import main from "/pages/main/main.js";
import createWallet from "/pages/createWallet/createWallet.js";
import giveName from "/pages/giveName/giveName.js";
import signIn from "/pages/signIn/signIn.js";
import home from "/pages/home/home.js";
import changePin from "/pages/changePin/changePin.js";
import exchangeRates from "/pages/exchangeRates/exchangeRates.js";
import walletBalance from "/pages/walletBalance/walletBalance.js";
import contacts from "/pages/contacts/contacts.js";
import viewContact from "/pages/viewContact/viewContact.js";
import editContacts from "/pages/editContacts/editContacts.js";
import sendError from "/pages/sendError/sendError.js";
import permission from "/pages/permission/permission.js";
import transfer from "/pages/transfer/transfer.js";
import transferReview from "/pages/transferReview/transferReview.js";
import updateVoice from "/pages/updateVoice/updateVoice.js";
import getPubKeys from "/pages/getPubKeys/getPubKeys.js";
import receiptHistory from "/pages/receiptHistory/receiptHistory.js";
import exportKeys from "/pages/exportKeys/exportKeys.js";
import editName from "/pages/editName/editName.js";
import settings from "/pages/settings/settings.js";
import receipt from "/pages/receipt/receipt.js";
import receiptBuy from "/pages/receiptBuy/receiptBuy.js";
import setEmail from "/pages/setEmail/setEmail.js";
import buy from "/pages/buy/buy.js";
import buyReview from "/pages/buyReview/buyReview.js";
import importKeys from "/pages/importKeys/importKeys.js";


export default [
    { path: /^\/$/i, component: main, name: "activities", target: '/' },
    { path: /^\/index.html$/i, component: main },
    { path: /^\/createWallet.html/i, component: createWallet, name: "createWallet", target: '/createWallet.html' },
    { path: /^\/giveName.html/i, component: giveName, name: "giveName", target: '/giveName.html' },
    { path: /^\/giveName.html/i, component: giveName, name: "changeName", target: '/giveName.html' },
    { path: /^\/updateVoice.html/i, component: updateVoice, name: "updateVoice", target: '/updateVoice.html' },
    { path: /^\/signIn.html/i, component: signIn, name: "signIn", target: '/signIn.html' },
    { path: /^\/home.html/i, component: home, name: "home", target: '/home.html' },
    { path: /^\/changePin.html/i, component: changePin, name: "changePin", target: '/changePin.html' },
    { path: /^\/getPubKeys.html/i, component: getPubKeys, name: "getPubKeys", target: '/getPubKeys.html' },
    { path: /^\/exportKeys.html/i, component: exportKeys, name: "exportKeys", target: '/exportKeys.html' },
    { path: /^\/importKeys.html/i, component: importKeys, name: "importKeys", target: '/importKeys.html' },
    { path: /^\/exchangeRates.html/i, component: exchangeRates, name: "exchangeRates", target: '/exchangeRates.html' },
    { path: /^\/walletBalance.html/i, component: walletBalance, name: "walletBalance", target: '/walletBalance.html' },
    { path: /^\/contacts.html/i, component: contacts, name: "contacts", target: '/contacts.html' },
    { path: /^\/viewContact.html/i, component: viewContact, name: "viewContact", target: '/viewContact.html' },
    { path: /^\/editContacts.html/i, component: editContacts, name: "editContacts", target: '/editContacts.html' },
    { path: /^\/sendError.html/i, component: sendError, name: "sendError", target: '/sendError.html' },
    { path: /^\/permission.html/i, component: permission, name: "permissions", target: '/permission.html' },
    { path: /^\/transfer.html/i, component: transfer, name: "transfer", target: '/transfer.html' },
    { path: /^\/transferReview.html/i, component: transferReview, name: "transferReview", target: '/transferReview.html' },
    { path: /^\/receiptHistory.html/i, component: receiptHistory, name: "receiptHistory", target: '/receiptHistory.html' },
    { path: /^\/editName.html/i, component: editName, name: "editName", target: '/editName.html' },
    { path: /^\/settings.html/i, component: settings, name: "settings", target: '/settings.html' },
    { path: /^\/setEmail.html/i, component: setEmail, name: "setEmail", target: '/setEmail.html' },
    { path: /^\/setEmail.html/i, component: setEmail, name: "updateEmail", target: '/setEmail.html' },
    { path: /^\/receipt.html/i, component: receipt, name: "receipt", target: '/receipt.html' },
    { path: /^\/receiptBuy.html/i, component: receiptBuy, name: "receiptBuy", target: '/receiptBuy.html' },
    { path: /^\/buy.html/i, component: buy, name: "buy", target: '/buy.html' },
    { path: /^\/buyReview.html/i, component: buyReview, name: "buyReview", target: '/buyReview.html' },
];
