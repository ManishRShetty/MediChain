import { Block } from './block';
import { Transaction } from './transaction';
import { createRecord, readRecord, readAllRecords } from '../database/database';

export class Blockchain {
    public chain: Block[];

    constructor() {
        this.chain = [];
    }

    public async initialize() {
        const blocks = await readAllRecords('blocks');
        if (blocks.length === 0) {
            const genesisBlock = new Block(0, [], '0');
            await this.addBlock(genesisBlock);
        } else {
            this.chain = blocks.map(blockData => JSON.parse(blockData.value) as Block);
        }
    }

    public async addBlock(block: Block) {
        await createRecord('blocks', block.hash, JSON.stringify(block.toJSON()));
        this.chain.push(block);
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public async createTransaction(transaction: Transaction) {
        try {
            const latestBlock = this.getLatestBlock();
            console.log('latest block',this.chain.length - 1);
            const newBlock = new Block(latestBlock.index + 1, [transaction], latestBlock.hash);
            await this.addBlock(newBlock);
            console.log('Transaction added to new block successfully');
        } catch (error: any) {
            console.error('Error creating transaction:', error.message);
        }
    }

    public async getAllBlocks(): Promise<Block[]> {
        const blocksData = await readAllRecords('blocks');
        return blocksData.map(data => JSON.parse(data.value));
    }
}
