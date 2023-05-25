// Import the required packages
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { postMine, getBlocks, syncChain } from './controller';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/api/v1/blocks', getBlocks);
app.post('/api/v1/mine', postMine);

const DEFAULT_PORT = 3000;
let PEER_PORT = DEFAULT_PORT;
if (process.env.PEER == "true") {
    PEER_PORT = 3000 + Math.floor(Math.random() * 1000);
}
app.listen(PEER_PORT, () => {
    console.log(`Server is running on PEER_PORT ${PEER_PORT}`);
    if (PEER_PORT !== 3000) {
        console.log("....... synching")
        syncChain()
        console.log("....... synched!")
    }
});
