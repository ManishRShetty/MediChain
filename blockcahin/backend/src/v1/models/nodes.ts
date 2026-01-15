import crypto from 'crypto';
import { Transaction } from './transaction';
import { Blockchain } from './blockchain';
import { createRecord, readRecord, readAllRecords } from '../database/database';
import axios from 'axios';

export class Nodes {
    private neighbourNodes: Array<any> = [];
    public publicKey: string;
    private privateKey: string;
    private p2pPort: number;
    private blockchain = new Blockchain();

    constructor(portNumber: number) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
        this.publicKey = publicKey.export({ format: 'pem', type: 'spki' }).toString();
        this.privateKey = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
        this.p2pPort = portNumber;
    }

    public async initNode() {
        try {
            await this.blockchain.initialize();
        } catch (error: any) {
            console.error('Error initializing blockchain:', error.message);
        }
    }

    public async getPermissionedTransactions(permissionsAssigned: Array<string>) {
        try {
            const transactions = await this.blockchain.getAllBlocks();
            return transactions.filter((transaction: any) => permissionsAssigned.includes(transaction.created_by));
        } catch (error: any) {
            console.error('Error getting permissioned transactions:', error.message);
            throw error;
        }
    }

    public async addNode(portNumber: number, public_key: string, nodeUrl: string) {
        const node = { portNumber: portNumber, public_key: public_key, nodeUrl: nodeUrl };
        this.neighbourNodes.push(node);
        await this.createNode(node); // Store node in the database
    }

    private async createNode(node: any) {
        try {
            const key = `${node.public_key}:${node.nodeUrl}`;
            await createRecord('nodes', key, JSON.stringify(node));
        } catch (error: any) {
            console.error('Error creating node:', error.message);
            throw error;
        }
    }

    public async getAllNodes(): Promise<any[]> {
        try {
            const records = await readAllRecords('nodes');
            return records.map(record => JSON.parse(record.value));
        } catch (error: any) {
            console.error('Error getting all nodes:', error.message);
            throw error;
        }
    }

    public async makeTransaction(data: JSON, access_list: Array<string>, created_by: string, title: string) {
        try {
            const transaction = new Transaction(data, title, created_by, access_list, this.publicKey);

            // Broadcast transaction to all nodes in the network
            const nodes = await this.getAllNodes();
            for (const node of nodes) {
                try {
                    const response = await axios.post(`http://${node.nodeUrl}:${node.portNumber}/network/transaction/make-transaction`, {
                        transaction: {
                            data: data,
                            title: title,
                            created_by: created_by,
                            access_list: access_list,
                            node: this.publicKey
                        },
                        hash: ''
                    });
                    if (response.status !== 200) {
                        throw new Error(`Data is not valid as per node: ${node.public_key}`);
                    }
                } catch (err:any) {
                    console.error(`Error broadcasting to node ${node.public_key}: ${err.message}`);
                }
            }

            // Add the transaction to the local blockchain
            await this.blockchain.createTransaction(transaction);
        } catch (error: any) {
            console.error('Error making transaction:', error.message);
            throw error;
        }
    }

    public async makeNodeTransaction(data: JSON, access_list: Array<string>, created_by: string, title: string, public_key: string) {
        try {
            const transaction = new Transaction(data, title, created_by, access_list, public_key);
            await this.blockchain.createTransaction(transaction);
        } catch (error: any) {
            console.error('Error making node transaction:', error.message);
        }
    }

    public async getAllTransactions() {
        try {
            const blocks = await this.blockchain.getAllBlocks();
            return blocks;
        } catch (error: any) {
            console.error('Error getting all transactions:', error.message);
            throw error;
        }
    }
}
