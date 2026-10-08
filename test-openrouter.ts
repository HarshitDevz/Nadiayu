import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("No OPENROUTER_API_KEY found in .env file");
  process.exit(1);
}

const openrouter = new OpenRouter({
  apiKey: apiKey
});

async function main() {
  console.log("Testing OpenRouter API...");
  try {
    // Stream the response to get reasoning tokens in usage
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "user",
            content: "How many r's are in the word 'strawberry'?"
          }
        ],
        stream: true
      }
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        response += content;
        process.stdout.write(content);
      }

      // Usage information comes in the final chunk
      if (chunk.usage) {
        console.log("\n\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens || 0);
      }
    }
    
    console.log("\n\nAPI Test Successful!");
  } catch (error) {
    console.error("\nAPI Test Failed:", error);
  }
}

main();
