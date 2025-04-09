import express from 'express';
import { connectToDB } from '../config/weaviate.js';
import weaviate, { configure } from 'weaviate-client'


const router = express.Router();

/**
 * Route to handle PDF buffer conversion to base64
 * Expected request body: { pdfBuffer: Buffer }
 * Returns: { success: boolean, message: string, data?: string }
 */

router.post('/create', async (req, res) => {
  const client = await connectToDB();

    try {

      const res2 = await client.collections.exists("PDFLibrary")
        await client.collections.delete('PDFLibrary');

        const response = await client.collections.create({
            name: 'PDFLibrary',
            properties: [{
              name: "pageNumber",
              dataType: configure.dataType.NUMBER,
            },
            {
              name: "pageImage",
              dataType: configure.dataType.BLOB
            },
            {
              name: "pageText",
              dataType: configure.dataType.TEXT
            }
            ],
            // Define your VoyageAI vectorizer 
            vectorizers: [
              weaviate.configure.vectorizer.multi2VecVoyageAI({
                name: "image_vector",
                imageFields: ["pageImage"],
            }),
              weaviate.configure.vectorizer.text2VecCohere({
                name: "text_vector",
                sourceProperties: ["pageText"]

              })],
              generative: weaviate.configure.generative.cohere()
          });

        // Return success response with base64 string
        return res.status(200).json({
            success: true,
            data: response,
            message: 'Collection Created!',
        });

    } catch (error) {
        // Log error for debugging (you might want to use a proper logger in production)
        console.error('Unable to create collection:', error);

        // Return error response
        return res.status(500).json({
            success: false,
            message: 'Unable to create collection:'
        });
    }
});

// Export the router
export default router;