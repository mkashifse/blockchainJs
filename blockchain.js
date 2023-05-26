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
        const { data, hash, nonce, node, block } = blockData;
        this.timestamp = Date.now();
        this.difficulty = 2;
        this.nonce = nonce;
        this.previousHash = "0x" + "0".repeat(64);
        this.hash = hash;
        this.node = node;
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
        this.node = new Miner({
            name: 'NODE:' + crypto.SHA1(Math.random().toString()).toString().substring(0, 10).toUpperCase(),
            id: crypto.SHA1(Math.random().toString()).toString()
        })
        this.mine();

    }

    sendTransaction({ from, to, value, fee }) {
        if (fee === 0) {
            console.error(`Transaction Failed!!, ${fee}`)
            return false;
        } else {
            this.memPool.push(new Transaction(from, to, value, fee))
            if (this.memPool.length > 9) {
                this.mine()
            }
            return true;
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

        this.blocks.push(new Block({ nonce, hash: "0x" + hash, data, previousHash, block: ++Blockchain.blockNumber }))
    }
}