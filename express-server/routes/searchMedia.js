import express from 'express';
import { connectToDB } from '../config/weaviate.js';
import { pdfToPng } from 'pdf-to-png-converter'

const router = express.Router();

/**
 * Route to handle PDF buffer conversion to base64
 * Expected request body: { pdfBuffer: Buffer }
 * Returns: { success: boolean, message: string, data?: string }
 */

router.post('/insert-media', async (req, res) => {
    const client = await connectToDB();

    try {

        // Check if request body contains PDF buffer
        if (!req.body.pdfBuffer) {
            return res.status(400).json({
                success: false,
                message: 'No PDF buffer provided in request body'
            });
        }

        const pdfBuffer = Buffer.from(req.body.pdfBuffer);

        // Validate that the input is actually a Buffer
        if (!Buffer.isBuffer(pdfBuffer)) {
            console.log("what is thus", req.body)
            console.log("what is thus", req.body.pdfBuffer)
            console.log("what is thus", typeof req.body.pdfBuffer)
            console.log("what is thus", typeof pdfBuffer)


            return res.status(400).json({
                success: false,
                message: 'Invalid input: pdfBuffer must be a Buffer'
            });
        }

        let pdfLibraryCollection = client.collections.get('PDFLibrary');

        const pdfImages = await pdfToPng(pdfBuffer);

        let itemsToInsert = []

        for (var page of pdfImages) {
            let pdfObject = {
                pageNumber: page.pageNumber,
                pageImage: page.content.toString('base64'),
            }

            // Insert
            let objectToInsert = {
                properties: pdfObject,
            }

            // Add object to batching array
            itemsToInsert.push(objectToInsert)
        }

        // Step 4: Bulk insert downloaded data into the "PDFLibrary" collection
        const result = await pdfLibraryCollection.data.insertMany(itemsToInsert)


        // Convert buffer to base64
        const base64String = req.body.pdfBuffer.toString('base64');

        // Return success response with base64 string
        return res.status(200).json({
            success: true,
            message: 'PDF successfully converted to base64',
            data: result.uuids
        });

    } catch (error) {
        // Log error for debugging (you might want to use a proper logger in production)
        console.error('Error converting PDF to base64:', error);

        // Return error response
        return res.status(500).json({
            success: false,
            message: 'Internal server error while converting PDF'
        });
    }
});

// Export the router
export default router;