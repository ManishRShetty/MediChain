import express from 'express';
import { addNode, getAllNodes,getDetails} from '../controller/NodeContoller';

const nodeRouter = express.Router();

nodeRouter.post('/add-node',addNode);
nodeRouter.get('/all',getAllNodes);
nodeRouter.get('/',getDetails);


export {nodeRouter};