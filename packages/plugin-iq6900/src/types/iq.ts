import { bringAgentWithWalletAddress } from "../functions/bringIQData";

// const onchainJson = await (async () => {
//     return await bringAgentWithWalletAddress();
// })();
let onchainJson: string;
(async () => {
    onchainJson = await bringAgentWithWalletAddress();
})();

export { onchainJson };