import { braincellsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createBraincellSchema,
  deleteBraincellSchema,
  updateBraincellSchema,
} from "@/lib/validation/braincell";
import { auth } from "@clerk/nextjs";

// Function to handle POST request for creating a braincell
export async function POST(req: Request) {
  try {
    // 1. Parse the request body to JSON
    const body = await req.json();

    // 2. Validate the parsed body with the createBraincellSchema
    const parseResult = createBraincellSchema.safeParse(body);

    // 3. Check if validation failed, log the error and return a 400 response
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    // 4. Destructure the validated data to get title and content
    const { title, content } = parseResult.data;

    // 5. Get the current user's ID from the authentication module
    const { userId } = auth();

    // 6. Check if userId is not available, return a 401 response
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 7. Generate an embedding for the braincell content
    const embedding = await getEmbeddingForBraincell(title, content);

    // 8. Create a new braincell in the database within a transaction
    const braincell = await prisma.$transaction(async (tx) => {
      const braincell = await tx.braincell.create({
        data: {
          title,
          content,
          userId,
        },
      });

      // 9. Upsert ("update" and "insert.") the embedding into the braincellsIndex with braincell ID and userId
      await braincellsIndex.upsert([
        {
          id: braincell.id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      // 10. Return the created braincell
      return braincell;
    });

    // 11. Return a 201 response with the created braincell data
    return Response.json({ braincell }, { status: 201 });
  } catch (error) {
    // 12. Catch and log any errors, return a 500 response
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Function to handle PUT request for updating a braincell
export async function PUT(req: Request) {
  try {
    // 1. Parse the request body to JSON
    const body = await req.json();

    // 2. Validate the parsed body with the updateBraincellSchema
    const parseResult = updateBraincellSchema.safeParse(body);

    // 3. Check if validation failed, log the error and return a 400 response
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    // 4. Destructure the validated data to get id, title, and content
    const { id, title, content } = parseResult.data;

    // 5. Find the existing braincell by its unique ID
    const braincell = await prisma.braincell.findUnique({ where: { id } });

    // 6. Check if the braincell does not exist, return a 404 response
    if (!braincell) {
      return Response.json(
        { error: "braincell data not found" },
        { status: 404 },
      );
    }

    // 7. Get the current user's ID from the authentication module
    const { userId } = auth();

    // 8. Check if the current user is not authorized to update the braincell
    if (!userId || userId !== braincell.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 9. Generate an embedding for the updated braincell content
    const embedding = await getEmbeddingForBraincell(title, content);

    // 10. Update the braincell in the database within a transaction
    const updatedBrancell = await prisma.$transaction(async (tx) => {
      const updatedBrancell = await tx.braincell.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      // 11. Upsert the updated embedding into the braincellsIndex
      await braincellsIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      // 12. Return the updated braincell
      return updatedBrancell;
    });

    // 13. Return a 200 response with the updated braincell data
    return Response.json({ updatedBrancell }, { status: 200 });
  } catch (error) {
    // 14. Catch and log any errors, return a 500 response
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
// Define the DELETE function to remove an existing braincell
export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // 1. Parse the request body as JSON

    const parseResult = deleteBraincellSchema.safeParse(body); // 2. Validate the request body against the deleteBraincellSchema

    if (!parseResult.success) {
      // 3. Check if the validation failed
      console.error(parseResult.error); // 4. Log the validation error
      return Response.json({ error: "Invalid input" }, { status: 400 }); // 5. Return a 400 Bad Request response if validation fails
    }

    const { id } = parseResult.data; // 6. Extract the braincell ID from the validated data

    const braincell = await prisma.braincell.findUnique({ where: { id } }); // 7. Retrieve the braincell record from the database using the ID

    if (!braincell) {
      // 8. Check if the braincell does not exist
      return Response.json({ error: "braincell not found" }, { status: 404 }); // 9. Return a 404 Not Found response if the braincell does not exist
    }

    const { userId } = auth(); // 10. Get the user ID from the authentication context

    if (!userId || userId !== braincell.userId) {
      // 11. Check if the user is not authenticated or does not own the braincell
      return Response.json({ error: "Unauthorized" }, { status: 401 }); // 12. Return a 401 Unauthorized response if authentication fails
    }

    await prisma.$transaction(async (tx) => {
      // 13. Start a database transaction
      await tx.braincell.delete({ where: { id } }); // 14. Delete the braincell record from the database
      await braincellsIndex.deleteOne(id); // 15. Remove the braincell's data from the braincellsIndex
    });

    return Response.json(
      { message: "Braincell data deleted" },
      { status: 200 },
    ); // 16. Return a 200 OK response indicating successful deletion
  } catch (error) {
    console.error(error); // 17. Catch and log any errors
    return Response.json({ error: "Internal server error" }, { status: 500 }); // 18. Return a 500 Internal Server Error response if an exception occurs
  }
}

// Define the getEmbeddingForBraincell function to generate text embeddings for a braincell
async function getEmbeddingForBraincell(
  title: string,
  content: string | undefined,
) {
  // 1. Concatenate the title and content, separating them with two new lines. If content is undefined, it defaults to an empty string
  return getEmbedding(title + "\n\n" + (content ?? ""));
  // 2. Call the getEmbedding function from the OpenAI library with the concatenated string and return its result
  //    This function sends the concatenated title and content to OpenAI's API to generate and retrieve the text embedding
}
