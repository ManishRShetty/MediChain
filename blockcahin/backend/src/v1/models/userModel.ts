import crypto from 'crypto';
import { createRecord, readRecord } from '../database/database';
import * as Constant from '../constants/constant';

export class User {
    public username: string;
    private password: string;
    public publicKey: string;
    private privateKey: string;
    // this will be private
    public permissions: string[] = [];

    constructor(username: string, password: string,permission:string[]){
        this.username = username;
        this.password = crypto.createHash('sha256').update(password).digest('hex');
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
        this.publicKey = publicKey.export({ format: 'pem', type: 'spki' }).toString();
        this.privateKey = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
        this.permissions=permission;
    }

    async saveToDatabase(): Promise<void> {
        try {
            await createRecord(Constant.USER_TABLE_NAME, this.username, JSON.stringify(this));
        } catch (error: any) {
            console.log(`Error occurred at userModel.ts -> saveToDatabase: ${error.message}`)
        }
    }

    static async getByUsernamePassword(username: string, password: string): Promise<User | null> {
        try {
            const userData = await readRecord(Constant.USER_TABLE_NAME, username);
            const parsedData = JSON.parse(userData) as User;
            
            const inputPasswordHash = crypto.createHash('sha256').update(password).digest('hex');
            
            if (parsedData.password === inputPasswordHash) {
                return parsedData;
            } else {
                console.log('Incorrect password');
                return null;
            }
        } catch (error: any) {
            console.log(`Error occurred at userModel.ts -> getByUsername: ${error.message}`);
            return null;
        }
    }

    public static async getByUsername(username:string){
        try{
            const userData = await readRecord(Constant.USER_TABLE_NAME, username);
            const parsedData = JSON.parse(userData) ;
            return parsedData;
        }catch(error:any){
            console.log(`Error occurred at userModel.ts -> getByPublicKey: ${error.message}`);
            return null;
        }
    }
}
