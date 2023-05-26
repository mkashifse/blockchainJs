// Import the required packages
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import bodyParser from 'body-parser';
import cors from 'cors';
import { EVENTS, eventBus, Blockchain } from './blockchain';
import { pub, sub } from './pubsub';

const app = express();
app.use(bodyParser.json());
app.use(cors());

export const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

const blockChain = new Blockchain();

app.get('/api/v1/data', blockChain.getData);
app.post('/api/v1/send-tnx', blockChain.sendTnx);

// When a client connects
io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED..!!");

    eventBus.on(EVENTS.NEW_BLK, (data) => {
        pub.publish(EVENTS.NEW_BLK, JSON.stringify(blockChain.blocks))
        socket.emit(EVENTS.NEW_BLK, data)
    })
    eventBus.on(EVENTS.NEW_TNX, (data) => {
        pub.publish(EVENTS.NEW_BLK, JSON.stringify(blockChain.memPool))
        socket.emit(EVENTS.NEW_TNX, data)
    })

    // When the client disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

sub.subscribe(EVENTS.NEW_BLK, (data, channel) => {
    const blocks = JSON.parse(data);
    console.log("RECEIVED", channel, blocks.length);
    blockChain.replaceChain(blocks)
})

sub.subscribe(EVENTS.NEW_TNX, (data, channel) => {
    const tnx = JSON.parse(data);
    console.log("RECEIVED", channel, tnx.length);
    blockChain.replaceMemPool(tnx)
})

const DEFAULT_PORT = 3000;
export let PEER_PORT = DEFAULT_PORT;
if (process.env.PEER == "true") {
    PEER_PORT = 3000 + Math.floor(Math.random() * 1000);
}