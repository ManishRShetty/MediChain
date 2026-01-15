import express from 'express';
import {makeTransaction} from './controller';
const networkTransactionRouter = express.Router();

networkTransactionRouter.post('/make-transaction',makeTransaction)

export {networkTransactionRouter};