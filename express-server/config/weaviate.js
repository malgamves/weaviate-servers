import weaviate from 'weaviate-client'
import dotenv from 'dotenv';

dotenv.config();

export const connectToDB = async () => {
  try {
    const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_HOST_URL,{
          authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_READ_KEY),
          headers: {
           'X-Cohere-Api-Key': process.env.COHERE_API_KEY || '',
         }
        }
      )
      console.log(`We are connected! ${await client.isReady()}`);
      return client
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

