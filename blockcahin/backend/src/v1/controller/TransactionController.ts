import { currentNode } from "../declarations";
import { Response, Request } from "express";



type makeTransactionReqType = {
    data: any,
    access_list: any,
    created_by: string,
    title: string,
    user_id: string
}

export const makeTransaction = async (req: Request<unknown, unknown, makeTransactionReqType>, res: Response) => {
    try {
        const { data, access_list, title, user_id } = req.body;
        console.log('Data received:', access_list);
        await currentNode.makeTransaction(data, access_list, user_id, title);
        console.log('Data added successfully');
        return res.status(200).json({ message: 'Data added successfully' });
    } catch (error: any) {
        console.log("Error occurred: ", error.message);
        return res.status(500).json({ message: 'Some error occurred at transaction controller make transaction' });
    }
}

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await currentNode.getAllTransactions();

        return res.status(200).json(transactions);
    } catch (error: any) {
        console.log("Error occurred: ", error.message);
        return res.status(500).json({ message: 'Some error occurred at transaction controller get all transactions' });
    }
}

export const getPermissionedTransactions = async (req: Request, res: Response) => {
    try {
        const {permissionsAssigned,user_id} = req.body;
        const transactions = await currentNode.getPermissionedTransactions(permissionsAssigned);
        return res.status(200).json(transactions);    
    }
    catch (error: any) {
        console.log("Error occurred: ", error.message);
        return res.status(500).json({ message: 'Some error occurred at transaction controller get permissioned transactions' });
    }
}