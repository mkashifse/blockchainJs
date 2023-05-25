// Import the required packages
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Blockchain, Miner } from './blockchain';
import axios from 'axios';
import * as redis from 'redis';
// Create an instance of the Express app
const app = express();

// Use body-parser middleware to parse incoming JSON
app.use(bodyParser.json());

// Use cors middleware to allow Cross-Origin Resource Sharing
app.use(cors());
console.log(process.env.PEER)

const blockChain = new Blockchain()

const pub = redis.createClient();
const sub = redis.createClient();
const connectRedis = async () => {
    await Promise.all([
        pub.connect(),
        sub.connect()
    ]);
}

connectRedis();

pub.on("connect", (err) => {
    if (!err) {
        console.log("REDIS PUB CONNECTED")
    }
})
sub.on("connect", (err) => {
    if (!err) {
        console.log("REDIS SUB CONNECTED")
    }
})

sub.subscribe("NEW_BLOCK", (data, channel) => {
    const blocks = JSON.parse(data);
    console.log("RECEIVED", channel, blocks.length);
    blockChain.replaceChain(blocks);
})

// Define a simple route
app.get('/api/v1/blocks', (req, res) => {
    res.status(200).json({
        totalBlocs: blockChain.blocks.length,
        blocks: blockChain.blocks
    });
});


app.post('/api/v1/mine', (req, res) => {
    blockChain.mine();
    pub.publish("NEW_BLOCK", JSON.stringify(blockChain.blocks))
    res.redirect("/api/v1/blocks")
});

const syncChain = async () => {
    const { data } = await axios.get('http://localhost:3000/api/v1/blocks')
    console.log(data)
    blockChain.blocks = data.blocks;
}

// Choose the port and start the server
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
