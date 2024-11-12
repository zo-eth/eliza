// import Database from "better-sqlite3";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { TwitterInteractionClient } from "@ai16z/eliza";
// import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqljs";
// import { defaultCharacter } from "@ai16z/eliza";
// import { buildConversationThread } from "@ai16z/eliza";
// import { AgentRuntime } from "@ai16z/eliza";
// import settings from "@ai16z/eliza";
// import { ModelProviderName } from "@ai16z/eliza";

// // const __dirname = path.dirname(new URL(".", import.meta.url).pathname);

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// describe("buildConversationThread", () => {
//     let runtime: AgentRuntime;
//     let client: TwitterInteractionClient;

//     beforeAll(async () => {
//         // Create an instance of the AgentRuntime
//         runtime = new AgentRuntime({
//             databaseAdapter: new SqliteDatabaseAdapter(
//                 new Database(":memory:")
//             ),
//             token: settings.OPENAI_API_KEY as string,
//             evaluators: [],
//             modelProvider: ModelProviderName.OPENAI,
//             character: defaultCharacter,
//             providers: [],
//             actions: [],
//         });

//         // Create an instance of the TwitterPostClient
//         client = new TwitterInteractionClient(runtime);

//         // Load cached Twitter credentials
//         const cookiesFilePath = path.join(
//             __dirname,
//             "../../../tweetcache/" +
//                 runtime.getSetting("TWITTER_USERNAME") +
//                 "_cookies.json"
//         );
//         console.log("Cookies file path:", cookiesFilePath);
//         if (fs.existsSync(cookiesFilePath)) {
//             const cookiesArray = JSON.parse(
//                 fs.readFileSync(cookiesFilePath, "utf-8")
//             );
//             client.setCookiesFromArray(cookiesArray);
//         } else {
//             throw new Error(
//                 "Twitter credentials not found. Please provide valid cookies.json."
//             );
//         }
//     });

//     it("should build a conversation thread from a tweet ID", async () => {
//         const tweetId = "1830058678197895517";

//         // Fetch the tweet from the API
//         const tweet = await client.getTweet(tweetId);
//         console.log("Original tweet:", JSON.stringify(tweet, null, 2));

//         // Build the conversation thread
//         const thread = await buildConversationThread(tweet, client);

//         console.log("Generated conversation thread:");
//         console.log(thread);

//         // Add assertions based on the expected structure and content of the thread
//         // expect(thread.includes("By: Aya Bochman (@ayaboch)")).toBe(true);
//         // expect(thread.includes("@ayaboch @DanBochman You should do nothing. Its opensource code, you have too much to lose by fighting this fight, this post will get u blacklisted be aware")).toBe(true);
//         // expect(thread.includes("@BLUECOW009 @ayaboch @DanBochman That's not how it works")).toBe(true);
//     }, 30000);
// });
