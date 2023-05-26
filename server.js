import { PEER_PORT, httpServer } from "./routes";

httpServer.listen(PEER_PORT, () => {
    console.log(`Server is running on PEER_PORT ${PEER_PORT}`);
    if (PEER_PORT !== 3000) {
        console.log("....... synching")
        syncChain()
        console.log("....... synched!")
    }
});
