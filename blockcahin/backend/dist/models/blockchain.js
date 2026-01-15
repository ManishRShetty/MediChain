"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
// src/models/Blockchain.ts
const block_1 = require("./block");
const database_1 = require("../database/database");
class Blockchain {
    constructor() {
        this.chain = [];
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const blocks = yield (0, database_1.readAllRecords)('blocks');
            if (blocks.length === 0) {
                const genesisBlock = new block_1.Block(0, [], '0');
                yield this.addBlock(genesisBlock);
            }
            else {
                this.chain = blocks.map(blockData => JSON.parse(blockData.value));
            }
        });
    }
    addBlock(block) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, database_1.createRecord)('blocks', block.hash, JSON.stringify(block.toJSON()));
            this.chain.push(block);
        });
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    createTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBlock = this.getLatestBlock();
            const newBlock = new block_1.Block(latestBlock.index + 1, [transaction], latestBlock.hash);
            yield this.addBlock(newBlock);
        });
    }
    getAllBlocks() {
        return __awaiter(this, void 0, void 0, function* () {
            const blocksData = yield (0, database_1.readAllRecords)('blocks');
            return blocksData.map(data => JSON.parse(data.value));
        });
    }
}
exports.Blockchain = Blockchain;
