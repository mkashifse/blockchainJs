const crypto = require("crypto-js");


export class Miner {
    constructor({ name, id }) {
        this.name = name;
        this.id = id;
        this.createdAt = Date.now()
    }
}

export class Block {
    constructor(blockData) {
        const { data, hash, nonce, node } = blockData;
        this.timestamp = Date.now();
        this.difficulty = 2;
        this.nonce = nonce;
        this.previousHash = "0x" + "0".repeat(64);
        this.hash = hash;
        this.node = node;
        Object.assign(this, blockData)

    }
}

export class Transaction {
    constructor({ from, to, data = {}, fee = 0 }) {
        this.from = from;
        this.to = to;
        this.data = data;
        this.fee = fee;
    }
}

export class Blockchain {
    constructor() {
        this.blocks = [];
        this.memPool = [];
        this.node = new Miner({
            name: 'NODE:' + crypto.SHA1(Math.random().toString()).toString().substring(0, 10).toUpperCase(),
            id: crypto.SHA1(Math.random().toString()).toString()
        })
        this.mine();

    }

    sendTransaction(from, to) {
        this.memPool(new Transaction(from, to))
        if (this.memPool.length > 9) {
            this.mine()
        }
    }

    replaceChain(blocks) {
        if (this.blocks.length < blocks.length) {
            this.blocks = blocks;
        }
    }

    syncChain(chain) {
        Object.assign(this, chain);
    }

    mine({ transactions } = { transactions: [] }) {
        const data = {
            transactions,
            node: this.node
        }
        let hash = crypto.SHA256("text").toString();
        let nonce = 0;
        while (hash.substring(0, 2) !== "00") {
            nonce++;
            hash = crypto.SHA256(Math.random().toString()).toString();
        }

        let previousHash = null;
        if (this.blocks.length) {
            previousHash = this.blocks[this.blocks.length - 1].hash;
        }

        this.blocks.push(new Block({ nonce, hash: "0x" + hash, data, previousHash }))
    }
}