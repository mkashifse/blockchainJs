// Import the required packages
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import bodyParser from 'body-parser';
import cors from 'cors';
import { postMine, getBlocks, syncChain } from './controller';

const app = express();
app.use(bodyParser.json());
app.use(cors());

export const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

app.get('/api/v1/blocks', getBlocks);
app.post('/api/v1/mine', postMine);

// When a client connects
io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED..!!");

    // Listen for a message event from the client
    socket.on("message", (data) => {
        console.log("Message from client:", data);

        // Emit a message event to the client with the received data
        socket.emit("message", data);
    });

    // When the client disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const DEFAULT_PORT = 3000;
export let PEER_PORT = DEFAULT_PORT;
if (process.env.PEER == "true") {
    PEER_PORT = 3000 + Math.floor(Math.random() * 1000);
}