import axios from 'axios';
import { pub, sub } from './pubsub';
import { Blockchain } from './blockchain';

export const blockChain = new Blockchain()

export const postMine = (req, res) => {
    blockChain.mine();
    pub.publish("NEW_BLOCK", JSON.stringify(blockChain.blocks))
    res.redirect("/api/v1/blocks")
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
})


export const syncChain = async () => {
    const { data } = await axios.get('http://localhost:3000/api/v1/blocks')
    console.log(data)
    blockChain.blocks = data.blocks;
}
