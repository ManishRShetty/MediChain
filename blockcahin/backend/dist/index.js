"use strict";
// // src/index.ts
// import { Blockchain } from './models/Blockchain';
// import { Transaction } from './models/Transaction';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const run = async () => {
//     const blockchain = new Blockchain();
//     await blockchain.initialize();
//     // Create a new transaction
//     const transaction = new Transaction('Alice', 'Bob', 100);
//     await blockchain.createTransaction(transaction);
//     // Retrieve all blocks
//     const allBlocks = await blockchain.getAllBlocks();
//     console.log('All Blocks:', allBlocks);
// };
// run();
const express_1 = __importDefault(require("express"));
const nodes_1 = require("./models/nodes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const currentNode = new nodes_1.Nodes(Number.parseInt(process.env.NODE_PORT_NUMBER) || 6000);
// app.route('/addNodes',)
