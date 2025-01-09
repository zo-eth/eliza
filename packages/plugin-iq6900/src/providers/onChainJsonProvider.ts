import {
    Provider,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
} from "@elizaos/core";


import { Connection, PublicKey } from "@solana/web3.js";

let network = process.env.IQSOlRPC;
const iqHost = "https://solanacontractapi.uc.r.appspot.com";

class OnChainJsonProvider {
    private connection: Connection;

    constructor() {
        this.connection = new Connection(network, "confirmed");
    }

    private async fetchDBPDA(userKey: string): Promise<string> {
        try {
            const response = await fetch(`${iqHost}/getDBPDA/${userKey}`);
            const data = await response.json();
            if (response.ok) {
                return data.DBPDA as string;
            } else {
                throw new Error(data.error || "Failed to fetch PDA");
            }
        } catch (error) {
            console.error("Error fetching PDA:", error);
            return "null";
        }
    }

    private convertTextToEmoji(text: string) {
        return text.replace(/\/u([0-9A-Fa-f]{4,6})/g, (match, code) => {
            return String.fromCodePoint(parseInt(code, 16));
        });
    }

    private async fetchTransactionInfo(txId: string) {
        try {
            const response = await fetch(`${iqHost}/get_transaction_info/${txId}`);
            if (response.ok) {
                const data = await response.json();
                return data.argData;
            }
        } catch (error) {
            console.error("Error fetching transaction info:", error);
        }
        return null;
    }

    private async getTransactionData(transactionData: {
        method: string;
        code: string;
        decode_break: number;
        before_tx: string;
    }): Promise<{ data: any; before_tx: string }> {
        if ("code" in transactionData) {
            return {
                data: {
                    code: transactionData.code,
                    method: transactionData.method,
                    decode_break: transactionData.decode_break,
                },
                before_tx: transactionData.before_tx,
            };
        } else {
            return {
                data: "fail",
                before_tx: "fail",
            };
        }
    }

    private async extractCommitMessage(dataTxid: string): Promise<string> {
        const txInfo = await this.fetchTransactionInfo(dataTxid);
        if (!txInfo) return "null";

        const type_field = txInfo.type_field || "null";

        if (type_field === "json") {
            const offset = txInfo.offset;
            return offset.split("commit: ")[1];
        } else {
            return "null";
        }
    }

    private async bringCode(dataTxid: string) {
        const txInfo = await this.fetchTransactionInfo(dataTxid);
        if (!txInfo) return {
            json_data: "false",
            commit_message: "false",
        };

        const tail_tx = txInfo.tail_tx || "null";
        const offset = txInfo.offset || "null";
        let chunks = [];
        let before_tx = tail_tx;

        while (before_tx !== "Genesis") {
            if (before_tx) {
                const chunk = await this.fetchTransactionInfo(before_tx);
                if (!chunk) {
                    console.log("No chunk found.");
                    return {
                        json_data: "false",
                        commit_message: "false",
                    };
                }

                const chunkData = await this.getTransactionData(chunk);
                if (chunkData.data == "null"){
                    console.error("chunk data undefined");
                    return {
                        json_data: "false",
                        commit_message: "false",
                    };
                }else{
                chunks.push(chunkData.data.code);
                before_tx = chunkData.before_tx;
                }
            } else {
                console.error("before data undefined");
                return {
                    json_data: "false",
                    commit_message: "false",
                };
            }
        }

        const textList = chunks.reverse();
        const textData = textList.join();

        return {
            json_data: this.convertTextToEmoji(textData),
            commit_message: offset,
        };
    }

    private async fetchSignaturesForAddress(dbAddress: PublicKey): Promise<string[]> {
        try {
            const signatures = await this.connection.getSignaturesForAddress(dbAddress, {
                limit: 30,
            });
            return signatures.map((sig) => sig.signature);
        } catch (error) {
            console.error("Error fetching signatures:", error);
            return [];
        }
    }

    private async findRecentJsonSignature(stringAddress: string): Promise<string> {
        const dbAddress = await this.fetchDBPDA(stringAddress);
        const signatures = await this.fetchSignaturesForAddress(new PublicKey(dbAddress));

        for (const signature of signatures) {
            const commit = await this.extractCommitMessage(signature);
            if (commit !== "null") return signature;
        }
        return "null";
    }

    async bringAgentWithWalletAddress(stringAddress: string) {
        elizaLogger.info("Connecting to Solana...(IQ6900)");
        const recent = await this.findRecentJsonSignature(stringAddress);
        if (recent === "null") {
            return { json_data: "null", commit_message: "null" };
        }
        const result = await this.bringCode(recent);
        elizaLogger.info("Your Json:"+ result.json_data.slice(0,20)+"....");
        return result;
    }
}




const onChainJsonProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string> => {
        const userWallet = process.env.IQ_WALLET_ADDRESS;
        if (userWallet != null){
        const provider = new OnChainJsonProvider();
        const result = await provider.bringAgentWithWalletAddress(userWallet);
        return result.json_data;
        }
        return "null";
    },

};

// Module exports
export { onChainJsonProvider };
