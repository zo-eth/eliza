import { Plugin } from "@elizaos/core";
import { onChainJsonProvider } from "./providers/onChainJsonProvider";

export const elizaCodeinPlugin: Plugin = {
    name: "eliza-codein",
    description: "Plugin that interacts with the on-chain inscription method “Code-In",
    actions: [
         /* custom actions */
    ],
    providers: [
        onChainJsonProvider
    ],
    evaluators: [
         /* custom evaluators */
    ],
    services: [],
    clients: [],
};

export default elizaCodeinPlugin;