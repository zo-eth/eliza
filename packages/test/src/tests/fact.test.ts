import dotenv from "dotenv";

import { IAgentRuntime, type Memory, type UUID } from "@ai16z/eliza";
import {
    getCachedEmbeddings,
    writeCachedEmbedding,
} from "../test_resources/cache.js";
import { zeroUuid } from "../test_resources/constants.js";
import { createRuntime } from "../test_resources/createRuntime.js";
import {
    GetTellMeAboutYourselfConversation1,
    GetTellMeAboutYourselfConversation2,
    GetTellMeAboutYourselfConversation3,
    jimFacts,
} from "../test_resources/data.js";
import { getOrCreateRelationship } from "../test_resources/getOrCreateRelationship.js";
import { populateMemories } from "../test_resources/populateMemories.js";
import { runAiTest } from "../test_resources/runAiTest.js";
import { type User } from "../test_resources/types.js";
import evaluator from "@ai16z/eliza";
import { MemoryManager } from "@ai16z/eliza/src/memory.ts";
import { TEST_EVALUATOR } from "../test_resources/testEvaluator.ts";
import { TEST_ACTION } from "../test_resources/testAction.ts";

dotenv.config({ path: ".dev.vars" });

describe("Facts Evaluator", () => {
    let user: User;
    let runtime: IAgentRuntime;
    let roomId = zeroUuid;

    beforeAll(async () => {
        const setup = await createRuntime({
            env: process.env as Record<string, string>,
            evaluators: [TEST_EVALUATOR],
            actions: [TEST_ACTION],
        });
        user = setup.session.user;
        runtime = setup.runtime;

        if (!user.id) {
            throw new Error("User ID is undefined");
        }

        const data = await getOrCreateRelationship({
            runtime,
            userA: user.id as UUID,
            userB: zeroUuid,
        });

        if (!data) {
            throw new Error("Relationship not found");
        }

        roomId = data.roomId;
    });

    afterAll(async () => {
        await cleanup(runtime, user.id as UUID);
    });

    test("Extract facts from conversations", async () => {
        await runAiTest("Extract programmer and startup facts", async () => {
            await populateMemories(runtime, user, roomId, [
                GetTellMeAboutYourselfConversation1,
            ]);

            const message: Memory = {
                userId: user.id as UUID,
                content: { text: "" },
                agentId: zeroUuid,
                roomId,
            };

            const result = await TEST_EVALUATOR.handler(runtime, message);
            const resultConcatenated = (result as string[]).join("\n");

            return (
                resultConcatenated.toLowerCase().includes("programmer") &&
                resultConcatenated.toLowerCase().includes("startup")
            );
        });

        await runAiTest(
            "Extract married fact, ignoring known facts",
            async () => {
                await populateMemories(runtime, user, roomId, [
                    GetTellMeAboutYourselfConversation2,
                    GetTellMeAboutYourselfConversation3,
                ]);

                await addFacts(runtime, user.id as UUID, roomId, jimFacts);

                const message: Memory = {
                    userId: user.id as UUID,
                    content: { text: "" },
                    agentId: zeroUuid,
                    roomId,
                };

                const result = await TEST_EVALUATOR.handler(runtime, message);
                const resultConcatenated = (result as string[]).join("\n");

                return (
                    !resultConcatenated.toLowerCase().includes("francisco") &&
                    !resultConcatenated.toLowerCase().includes("38") &&
                    resultConcatenated.toLowerCase().includes("married")
                );
            }
        );
    }, 120000); // Adjust the timeout as needed for your tests
});

async function cleanup(runtime: IAgentRuntime, roomId: UUID) {
    const factsManager = new MemoryManager({
        runtime,
        tableName: "facts",
    });

    await factsManager.removeAllMemories(roomId);
    await runtime.messageManager.removeAllMemories(roomId);
}

async function addFacts(
    runtime: IAgentRuntime,
    userId: UUID,
    roomId: UUID,
    facts: string[]
) {
    for (const fact of facts) {
        const existingEmbedding = await getCachedEmbeddings(fact);

        const factsManager = new MemoryManager({
            runtime,
            tableName: "facts",
        });

        const bakedMemory = await factsManager.addEmbeddingToMemory({
            userId: userId,
            content: { text: fact },
            agentId: runtime.agentId,
            roomId: roomId,
            embedding: existingEmbedding,
        });

        await factsManager.createMemory(bakedMemory);

        if (!existingEmbedding) {
            writeCachedEmbedding(fact, bakedMemory.embedding as number[]);
            // Ensure there's a slight delay for asynchronous operations to complete
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
}
