import { bringAgentWithWalletAddress } from "../functions/bringIQData";


const onchainJson = await (async () => {
    return await bringAgentWithWalletAddress();
})();

export { onchainJson };