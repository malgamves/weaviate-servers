import weaviate from 'weaviate-client';
import 'dotenv/config';

const weaviateURL = process.env.WEAVIATE_HOST_URL as string;
const weaviateKey = process.env.WEAVIATE_READ_KEY as string;
const cohereKey = process.env.COHERE_API_KEY as string;
const openaiKey = process.env.OPENAI_API_KEY as string;
const voyageaiKey = process.env.VOYAGEAI_API_KEY as string

export const connectToDB = async () => {
  try {
    const client = await weaviate.connectToWeaviateCloud(weaviateURL,{
          authCredentials: new weaviate.ApiKey(weaviateKey),
          headers: {
           'X-Cohere-Api-Key': cohereKey,
           'X-OpenAI-Api-Key': openaiKey,
           'X-VoyageAI-Api-Key': voyageaiKey,  // Replace with your inference API key
         }
        }
      )
      console.log(`We are connected! ${await client.isReady()}`);
      return client
  } catch (error) {
    if (error instanceof Error)
      console.error(`Error: ${error.message}`);
      process.exit(1);
  }
};

