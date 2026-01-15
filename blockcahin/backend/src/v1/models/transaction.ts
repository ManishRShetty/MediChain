import crypto, { randomUUID } from 'crypto';

export class Transaction {
    public id: string;
    public timestamp: string;
    public title: string;
    public user_public_key: string;
    public node_public_key: string;
    private access: string[];
    private data: any; // Change `JSON` to `any` or `unknown` if `data` can have various structures

    constructor(data: any, title: string, user_public_key: string, access_list: string[], node_public_key: string) {
        this.id = randomUUID(); // Corrected to call randomUUID() to generate UUID
        this.title = title;
        this.node_public_key = node_public_key;
        this.user_public_key = user_public_key;
        this.access = [...access_list]; // Copy access_list to this.access array
        this.timestamp = new Date().toISOString();
        this.data = data; // Assuming data is initialized correctly
    }

    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            title: this.title,
            node_public_key: this.node_public_key,
            user_public_key: this.user_public_key,
            data: this.data,
        };
    }
}
