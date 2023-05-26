const crypto = require("crypto-js");
import axios from 'axios';
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const EVENTS = {
    NEW_BLK: "NEW_BLK",
    NEW_TNX: "NEW_TNX",
}

export class Miner {
    constructor({ name, id }) {
        this.name = name;
        this.id = id;
        this.createdAt = Date.now()
        this.value = 0;
    }

    mine({ transactions, previousHash }) {
        let hash = crypto.SHA256("text").toString();
        let nonce = 0;
        while (hash.substring(0, 2) !== "00") {
            nonce++;
            hash = crypto.SHA256(Math.random().toString()).toString();
        }


        return new Block({
            nonce,
            hash: "0x" + hash,
            previousHash,
            transactions,
            block: ++Blockchain.blockNumber
        })
    }
}

export class Block {
    constructor(blockData) {
        const { data, hash, nonce, node, block, transactions } = blockData;
        this.timestamp = Date.now();
        this.difficulty = 2;
        this.nonce = nonce;
        this.previousHash = "0x" + "0".repeat(64);
        this.hash = hash;
        this.node = node;
        this.transactions = transactions;
        this.block = block;
        Object.assign(this, blockData)

    }
}

export class Transaction {
    constructor({ from, to, value, fee = 0 }) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.fee = fee;
        this.timestamp = Date.now();
    }
}

export class Blockchain {
    static blockNumber = 0;
    constructor() {
        this.blocks = [];
        this.memPool = [];
        this.miners = [];
        this.addNewMinor();
        this.syncChain();
    }

    clearMemPool() {
        this.memPool = []
    }

    syncChain = async () => {
        const { tnx, blocks } = await axios.get('http://localhost:3000/api/v1/data')
        this.replaceChain(blocks);
        this.replaceMemPool(tnx);
    }

    activateMiners() {
        let previousHash = null;
        if (this.blocks.length) {
            previousHash = this.blocks[this.blocks.length - 1].hash;
        }
        const block = this.miners[0].mine({
            transactions: this.memPool,
            previousHash
        });
        this.blocks.push(block);
        eventBus.emit(EVENTS.NEW_BLK, JSON.stringify(this.blocks));
    }

    addNewMinor() {
        const miner = new Miner({
            name: 'NODE:' + crypto.SHA1(Math.random().toString()).toString().substring(0, 10).toUpperCase(),
            id: crypto.SHA1(Math.random().toString()).toString()
        });
        this.miners.push(miner);
    }

    replaceChain(blocks) {
        if (this.blocks.length < blocks.length) {
            this.blocks = blocks;
        }
    }

    replaceMemPool(tnx) {
        this.memPool = tnx;
    }

    // ============= controller routes
    sendTnx(req, res) {
        const { from, to, value, fee } = req.body;
        if (fee < 20) {
            res.status(401, `Transaction Failed!!, Low FEE: ${fee}. Fee must be >= 20`)
        } else {
            this.memPool.push(new Transaction({ from, to, value, fee }))
            eventBus.emit(EVENTS.NEW_TNX, JSON.stringify(this.memPool))
            if (fee == 200 || this.memPool.length === 10) {
                this.activateMiners();
            }
        }
    }

    getBlock(req, res) {
        res.status(200).json(this.blocks)
    }

    getData(req, res) {
        res.status(200).json({
            meta: {
                latestTransactions: this.memPool.length,
                totalBlocks: this.blocks.length
            },
            tnx: this.memPool,
            blocks: this.blocks
        })
    }



}