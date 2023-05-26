import axios from 'axios';
import { pub, sub } from './pubsub';
import { Blockchain } from './blockchain';
import { EventEmitter } from 'events';
export const eventBus = new EventEmitter();


export const blockChain = new Blockchain()


export const postMine = (req, res) => {
    blockChain.mine();
    pub.publish("NEW_BLOCK", JSON.stringify(blockChain.blocks))
    getBlocks(req, res)
}


export const sendTransaction = (req, res) => {
    const { from, to, value, fee } = req.body;
    const status = blockChain.sendTransaction({ from, to, value, fee })
    if (!status) {
        res.status(401).json({ message: "Transaction Failed" })
    }
    getBlocks(req, res)

}

export const getBlocks = (req, res) => {
    res.status(200).json({
        totalBlocs: blockChain.blocks.length,
        blocks: blockChain.blocks
    });
}

sub.subscribe("NEW_BLOCK", (data, channel) => {
    const blocks = JSON.parse(data);
    console.log("RECEIVED", channel, blocks.length);
    blockChain.replaceChain(blocks)
    eventBus.emit("NEW_BLOCK", data)
})


export const syncChain = async () => {
    const { data } = await axios.get('http://localhost:3000/api/v1/blocks')
    console.log(data)
    blockChain.blocks = data.blocks;
}
