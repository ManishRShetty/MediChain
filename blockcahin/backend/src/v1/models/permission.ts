import { createRecord, readRecord } from '../database/database';
import { currentNode } from '../declarations';
import { User } from './userModel';
class Permission {
    public username: string;
    public permission: string;
    public counter: number;
    public isCompleted: boolean = false;
    public approvedList: string[] = [];

    constructor(publicKey: string, permission: string) {
        this.username = publicKey;
        this.permission = permission;
        this.counter = 0;
    }

    public static async approveTransaction (username: string,permission:string, node: string): Promise<void> {
        if(!username || !permission || !node){
            return;
        }
        const permissionObj = await Permission.getByUsername(username,permission);
        if(!permissionObj){
            return;
        }
        if (permissionObj.approvedList.includes(node)) {
            return; // Already approved
        }
        permissionObj.counter++;
        permissionObj.approvedList.push(node);
        const num = await currentNode.getAllNodes();
        if (permissionObj.counter >= num.length) {
            permissionObj.isCompleted = true;
            const user = await User.getByUsername(username);
            user!.permissions.push(permission);
            await user!.saveToDatabase();
        }

        await permissionObj.saveToDatabase();
    }

    public async saveToDatabase(): Promise<void> {
        try {
            const key = `${this.username}:${this.permission}`;
            await createRecord('permissions', key, JSON.stringify(this));
        } catch (error) {
            console.error('Error saving to database:', error);
            throw error; // Consider handling or rethrowing the error
        }
    }

    static async getByUsername(publicKey: string, permission: string): Promise<Permission | null> {
        try {
            const key = `${publicKey}:${permission}`;
            const permissionData = await readRecord('permissions', key);
            if (!permissionData) return null; // Handle case where record is not found

            const permissionObj = JSON.parse(permissionData);
            const permissionInstance = new Permission(permissionObj.publicKey, permissionObj.permission);
            permissionInstance.counter = permissionObj.counter || 0; // Ensure counter defaults to 0 if not present
            permissionInstance.isCompleted = permissionObj.isCompleted || false; // Default to false
            permissionInstance.approvedList = permissionObj.approvedList || []; // Default to empty array

            return permissionInstance;
        } catch (error) {
            console.error('Error fetching from database:', error);
            return null; // Return null on error (could also throw or handle differently based on use case)
        }
    }
}

export { Permission };
