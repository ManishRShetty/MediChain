import { User } from "../models/userModel";
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import * as Constant from '../constants/constant';
import { Permission } from "../models/permission";


type addUserRequestType = {
    username: string,
    password: string,
}

export const addUser = async (req: Request<unknown, unknown, addUserRequestType>, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = new User(username, password,[]);

        await user.saveToDatabase();
        return res.status(200).json({message:'User created successfully'});
    } catch (error: any) {
        console.log('Error occurred at user controller add user:', error.message);
        return res.status(500).json({ "message": "Something went wrong, check server logs." });
    }
}

type loginUserRequestType = {
    username: string,
    password: string
}

export const loginUser = async (req: Request<unknown, unknown, loginUserRequestType>, res: Response) => {
    try {
        const { username, password } = req.body;
        
        // Fetch user by username and password
        const user = await User.getByUsernamePassword(username, password);

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const payload = {
            publicKey: user.publicKey,
            username: user.username,
            permissions: user.permissions
        };

        // Generate JWT token
        const token = jwt.sign(payload, Constant.JWT_SECRET, { expiresIn: '1h' });

        // Send response with JWT token
        return res.status(200).json({ 
            message: "User logged in",
            token 
        });
    } catch (error: any) {
        const message = `Error occurred at user controller login user: ${error.message}`;
        console.log(message);
        return res.status(500).json({ message });
    }
}


export const joinNetwork = async (req:Request, res:Response)=>{
   try {
        const {username,permission}= await req.body;
        const permissionObj = new Permission(username,permission);
        await permissionObj.saveToDatabase();
        
        return res.json({message:"requested...."}).status(200);
   } catch (error:any) {
        console.log('Error occured at userController -> joinNetwork: ',error.message());
        return res.json({message:"error occured Check server logs"}).status(500);
   }
}


export const approvePermission = async (req:Request, res:Response)=>{
    try {
        const {username,permission,node}= await req.body;
        const permissionObj = await Permission.getByUsername(username,permission);
        if(!permissionObj){
            return res.json({message:"Permission not found"}).status(404);
        }
        await Permission.approveTransaction(username,permission,node);
        await permissionObj.saveToDatabase();
        return res.json({message:"Permission approved"}).status(200);
    } catch (error:any) {
        console.log('Error occured at userController -> approvePermission: ',error.message());
        return res.json({message:"error occured Check server logs"}).status(500);
    }
}