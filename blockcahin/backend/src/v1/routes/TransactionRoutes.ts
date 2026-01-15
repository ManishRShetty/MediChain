import express from 'express';
import { makeTransaction ,getAllTransactions, getPermissionedTransactions} from '../controller/TransactionController';
import { validateUser } from '../auth/userAuth';
const transactionRouter = express.Router();

transactionRouter.post('/make-transaction',validateUser,makeTransaction);
transactionRouter.get('/all',validateUser, getAllTransactions);
transactionRouter.get('/permissioned',validateUser, getPermissionedTransactions);
export {transactionRouter};