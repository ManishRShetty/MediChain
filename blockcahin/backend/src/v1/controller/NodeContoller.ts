import { Request, Response } from "express";
import { currentNode } from "../declarations";
import axios from "axios";

type addNodeResponse = {
    message: string
}

type addNodeRequest = {
    PortNumber: number,
    PublicKey: string,
    nodeUrl: string
}
const os = require('os');
function getServerIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface in interfaces) {
        for (const alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1'; // fallback to localhost
}

export const addNode = async (req: Request<unknown, unknown, addNodeRequest>, res: Response<addNodeResponse>) => {
    try {
        const { PortNumber, PublicKey, nodeUrl } = req.body;
        console.log(`Node ${PublicKey} added successfully......!`);
        const currentNodeIp = getServerIpAddress();
        const response = await axios.post(`http://${nodeUrl}:${PortNumber}/network/nodes/connect`, {
            portNumber: PortNumber,
            public_key: currentNode.publicKey,
            nodeUrl: currentNodeIp
        });
        
        if (response.status !== 200) {
            return res.status(500).json({ message: 'Node failed to connect' });
        }
        currentNode.addNode(PortNumber, PublicKey, nodeUrl);

        return res.status(200).json({ message: `Node :${PublicKey} added successfully` });
    } catch (error: any) {
        console.error(`Error occurred in addNode: ${error.message}`);
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}

export const getAllNodes = async (req: Request, res: Response) => {
    try {
        const nodes = await currentNode.getAllNodes();  
        return res.status(200).json(nodes);
    } catch (error: any) {
        console.error('Error occurred at NodeController -> getAllNodes', error.message);
        return res.status(500).json({ message: "Error occurred, check server logs" });
    }
}


export const getDetails = async (req: Request, res: Response) => {
try {
    const details  = {PublicKey:currentNode.publicKey, PortNumber:3000, nodeUrl:getServerIpAddress()};
    return res.status(200).json(details);
} catch (error: any) {
    console.error('Error occurred at NodeController -> getDetails', error.message);
    return res.status(500).json({ message: "Error occurred, check server logs" });
}
}