import {Request,Response} from 'express';
import { currentNode } from '../../declarations';

type nodesConnectRequestType= {
    portNumber:number,
    public_key:string,
    nodeUrl:string
}

export const nodesConnect = async(req: Request<unknown,unknown,nodesConnectRequestType>, res: Response) => {
    try {
        const {portNumber,public_key,nodeUrl}= await req.body;
        currentNode.addNode(portNumber,public_key,nodeUrl);
        return res.json({message:"node connected successfully"}).status(200);
    } catch (error: any) {
        console.log("error occured at network -> contoller -> nodes connect: ", error.message());
        return res.json({ message : "unable to connect : check server logs" });
    }
}