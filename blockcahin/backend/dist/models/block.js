"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Block {
    constructor(index, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
    calculateHash() {
        const data = `${this.index}${this.timestamp}${JSON.stringify(this.transactions)}${this.previousHash}`;
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
    toJSON() {
        return {
            index: this.index,
            timestamp: this.timestamp,
            transactions: this.transactions.map(tx => tx.toJSON()),
            previousHash: this.previousHash,
            hash: this.hash,
        };
    }
}
exports.Block = Block;
