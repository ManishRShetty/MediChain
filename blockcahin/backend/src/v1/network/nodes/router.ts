import express from 'express';
import { nodesConnect } from './controller';

const networkNodesController = express.Router();

networkNodesController.post('/connect',nodesConnect);

export {networkNodesController};