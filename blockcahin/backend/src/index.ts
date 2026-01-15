import express, { Request, Response } from 'express';
import { nodeRouter } from './v1/routes/NodeRoutes';
import { userRouter } from './v1/routes/UserRoutes';
import { transactionRouter } from './v1/routes/TransactionRoutes';
import { currentNode } from './v1/declarations';
import { networkTransactionRouter } from './v1/network/transaction/router';
import { networkNodesController } from './v1/network/nodes/router';
import { NODE_PORT_NUMBER } from './v1/constants/constant';
var cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());

// Frontend
app.use('/api/v1/nodes', nodeRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/transaction', transactionRouter);


// For node communication
app.use('/network/transaction',networkTransactionRouter);
app.use('/network/nodes',networkNodesController);

app.get('/test-api', (req: Request, res: Response) => {
    console.log('Everything is working bro...');
    return res.status(200).json({ message: 'Everything is working bro...' });
});


app.post('/init-block', (req: Request, res: Response) => {
    console.log('Received POST request at /init-block');
    try {
        currentNode.initNode();
        return res.status(200).json({ message: "Initialized blockchain successfully." });
    } catch (error: any) {
        console.log('Error occurred at init node:', error.message);
        return res.status(500).json({ message: "Something went wrong." });
    }
});


const PORT = NODE_PORT_NUMBER;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
