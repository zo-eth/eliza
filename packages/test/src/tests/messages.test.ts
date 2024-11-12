import dotenv from "dotenv";
import { formatFacts } from "@ai16z/plugin-bootstrap";
import { zeroUuid } from "../test_resources/constants.js";
import { createRuntime } from "../test_resources/createRuntime.js";
import { getOrCreateRelationship } from "../test_resources/getOrCreateRelationship.js";
import { type User } from "../test_resources/types.js";
import {
    createRelationship,
    formatActors,
    formatMessages,
    getActorDetails,
} from "@ai16z/eliza";
import {
    IAgentRuntime,
    type Actor,
    type Content,
    type Memory,
    type UUID,
} from "@ai16z/eliza";

dotenv.config({ path: ".dev.vars" });

describe("Messages Library", () => {
    let runtime: IAgentRuntime, user: User, actors: Actor[];

    beforeAll(async () => {
        const setup = await createRuntime({
            env: process.env as Record<string, string>,
        });
        runtime = setup.runtime;
        user = setup.session.user;
        actors = await getActorDetails({
            runtime,
            roomId: "00000000-0000-0000-0000-000000000000",
        });
    });

    test("getActorDetails should return actors based on given roomId", async () => {
        // create a room and add a user to it
        const userA = user?.id as UUID;
        const userB = zeroUuid;

        await createRelationship({
            runtime,
            userA,
            userB,
        });

        const { roomId } = await getOrCreateRelationship({
            runtime,
            userA,
            userB,
        });

        const result = await getActorDetails({
            runtime,
            roomId,
        });

        expect(result.length).toBeGreaterThan(0);
        result.forEach((actor: Actor) => {
            expect(actor).toHaveProperty("name");
            expect(actor).toHaveProperty("details");
            expect(actor).toHaveProperty("id");
        });
    });

    test("formatActors should format actors into a readable string", () => {
        const formattedActors = formatActors({ actors });
        actors.forEach((actor) => {
            expect(formattedActors).toContain(actor.name);
        });
    });

    test("formatMessages should format messages into a readable string", async () => {
        const messages: Memory[] = [
            {
                content: { text: "Hello" },
                userId: user.id as UUID,
                roomId: "00000000-0000-0000-0000-000000000000",
                agentId: zeroUuid,
            },
            {
                content: { text: "How are you?" },
                userId: "00000000-0000-0000-0000-000000000000",
                roomId: "00000000-0000-0000-0000-000000000000",
                agentId: zeroUuid,
            },
        ];
        const formattedMessages = formatMessages({ messages, actors });
        messages.forEach((message: Memory) => {
            expect(formattedMessages).toContain(
                (message.content as Content).text
            );
        });
    });

    test("formatFacts should format facts into a readable string", async () => {
        const facts: Memory[] = [
            {
                content: { text: "Reflecting on the day" },
                userId: user.id as UUID,
                roomId: "00000000-0000-0000-0000-000000000000",
                agentId: zeroUuid,
            },
            {
                content: { text: "Thoughts and musings" },
                userId: "00000000-0000-0000-0000-000000000000",
                roomId: "00000000-0000-0000-0000-000000000000room",
                agentId: zeroUuid,
            },
        ];
        const formattedFacts = formatFacts(facts);
        facts.forEach((fact) => {
            expect(formattedFacts).toContain(fact.content.text);
        });
    });
});
