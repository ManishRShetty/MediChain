import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';

const dbPath = './mydb';

const db: LevelUp = levelup(leveldown(dbPath));

export const createRecord = async (table: string, key: string, value: any) => {
    const tableKey = `${table}:${key}`;
    await db.put(tableKey, value);
};

export const readRecord = async (table: string, key: string): Promise<any> => {
    const tableKey = `${table}:${key}`;
    try {
        const value = await db.get(tableKey);
        return value;
    } catch (error) {
        throw new Error('Record not found');
    }
};

export const updateRecord = async (table: string, key: string, value: any) => {
    const tableKey = `${table}:${key}`;
    await db.put(tableKey, value);
};

export const deleteRecord = async (table: string, key: string) => {
    const tableKey = `${table}:${key}`;
    await db.del(tableKey);
};

export const readAllRecords = async (table: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const records: any[] = [];
        db.createReadStream().on('data', ({ key, value }) => {
            if (key.toString().startsWith(`${table}:`)) {
                records.push({ key: key.toString().split(`${table}:`)[1], value });
            }
        })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve(records);
            });
    });
};
