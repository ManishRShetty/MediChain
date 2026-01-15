import { Request, Response } from "express"
import { currentNode } from "../../declarations";


export const makeTransaction = async (req:Request, res:Response)=>{
    try {
        const {transaction,hash}=await req.body;
     await currentNode.makeNodeTransaction(transaction.data, transaction.title, transaction.created_by, transaction.access_list, transaction.publicKey);
        return res.json({message:"transaction done...."}).status(200);
    } catch (error:any) {
        console.log("error occured at network->controller->makeTransaction: ",error.message());
        return res.json({message:"error occured check server logs"}).status(500);
    }
}