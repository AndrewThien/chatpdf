import { PineconeClient  } from "@pinecone-database/pinecone";     
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { querystring } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
  const pinecone = new PineconeClient();

  try {
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pinecone.Index("chatpdf");
    const namespace = convertToAscii(fileKey);
    const queryRequest = {
        topK: 5,
        vector: embeddings,
        includeMetadata: true,
        namespace: namespace,
    }
    const queryResponse = await index.query({queryRequest}); 
    return queryResponse.matches || [];
  } catch (error) {
    console.log("Error initializing or querying Pinecone:", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}