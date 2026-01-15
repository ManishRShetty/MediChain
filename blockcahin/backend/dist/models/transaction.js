"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const crypto_1 = __importStar(require("crypto"));
class Transaction {
    constructor(data, title, public_key, access_list) {
        this.access = [];
        this.id = crypto_1.randomUUID.toString();
        this.title = title;
        this.public_key = public_key;
        access_list.forEach((e) => this.access.push(e));
        this.timestamp = new Date().toISOString();
        const jsonToStr = JSON.stringify(data);
        this.encrypted_string = this.calculateEncryptedString(jsonToStr, public_key);
    }
    calculateEncryptedString(jsonString, public_key) {
        const encryptedData = crypto_1.default.publicEncrypt(public_key, Buffer.from(jsonString));
        return encryptedData.toString('base64');
    }
    static decryptEncryptedString(privateKeyPem, encryptedData) {
        const decryptedData = crypto_1.default.privateDecrypt(privateKeyPem, Buffer.from(encryptedData, 'base64'));
        const decryptedJson = JSON.parse(decryptedData.toString());
        return decryptedJson;
    }
    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            title: this.title,
            public_key: this.public_key,
            encrypted_string: this.encrypted_string
        };
    }
}
exports.Transaction = Transaction;
