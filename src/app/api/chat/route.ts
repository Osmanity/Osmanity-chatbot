import { braincellsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

interface Braincell {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Function: POST
export async function POST(req: Request) {
  try {
    // 1. Parse the JSON body from the request.
    const body = await req.json();

    // 2. Extract chat messages from the request body.
    const messages: ChatCompletionMessage[] = body.messages;

    // 3. Truncate the messages array to the last 6 messages.
    const messagesTruncated = messages.slice(-6);

    // 4. Generate an embedding for the concatenated content of truncated messages.
    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    // 5. Retrieve the user ID from the authenticated session.
    const { userId } = auth();

    // 6. Query the braincellsIndex with the generated embedding and user filter.
    const vectorQueryResponse = await braincellsIndex.query({
      vector: embedding,
      topK: 10,
      filter: { userId },
    });

    // 7. Find relevant braincells in the database using the IDs from the query response.
    const relevantBraincells = await prisma.braincell.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    // 8. Log the found relevant braincells.
    console.log("Relevant Braincells found: ", relevantBraincells);

    // 9. Create a system message for the chatbot.
    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "You are an intelligent virutal assistance chatbot in my portfolio website Osmanity for ibrahim osman. You answer the user's question based on their existing data about me. please format the response as easy readable as possible, with a maximum of 2 messages and keep the answers short and concise " +
        "The relevant data for this query are:\n" +
        relevantBraincells
          .map(
            (braincell: Braincell) =>
              `Title: ${braincell.title}\n\nContent:\n${braincell.content}`,
          )
          .join("\n\n"),
    };

    // 10. Create a chat completion using OpenAI's API with the system and user messages.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    // 11. Stream the response from OpenAI.
    const stream = OpenAIStream(response);

    // 12. Return the streaming text response.
    return new StreamingTextResponse(stream);
  } catch (error) {
    // 13. Handle any errors that occur in the try block.
    console.error(error);

    // 14. Return a JSON response with an error message and a status code.
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
