
import { Transaction } from './transaction';
import crypto from 'crypto';

export class Block {
    public index: number;
    public timestamp: string;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;

    constructor(index: number, transactions: Transaction[], previousHash: string = '') {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    private calculateHash(): string {
        const data = `${this.index}${this.timestamp}${JSON.stringify(this.transactions)}${this.previousHash}`;
        return crypto.createHash('sha256').update(data).digest('hex');
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
