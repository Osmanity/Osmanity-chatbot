// Braincell Virutal Assitance Feature to make custom to train your osmanity avatar

import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw Error("PINECONE_API_KEY is not set");
}

const pinecone = new Pinecone({
  environment: "eu-west4-gcp",
  apiKey,
});

export const braincellsIndex = pinecone.Index("osmanityvirtualassist");
