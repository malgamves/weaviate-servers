import express from 'express';
import { connectToDB } from '../config/weaviate.js';
import { pdfToPng } from 'pdf-to-png-converter'
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


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
        const pdfArray = new Uint8Array(req.body.pdfBuffer)

        // Validate that the input is actually a Buffer
        if (!Buffer.isBuffer(pdfBuffer)) {
            // console.log("what is thus", req.body)
            // console.log("what is thus", req.body.pdfBuffer)
            // console.log("what is thus", typeof req.body.pdfBuffer)
            // console.log("what is thus", typeof pdfBuffer)


            return res.status(400).json({
                success: false,
                message: 'Invalid input: pdfBuffer must be a Buffer'
            });
        }

        let pdfLibraryCollection = client.collections.get('PDFLibrary');

        // handle images
        const pdfImages = await pdfToPng(pdfBuffer);

        // handle text
        const loadingTask = pdfjsLib.getDocument({ data: pdfArray });
        const pdfDocument = await loadingTask.promise;

        const numPages = pdfDocument.numPages;
        const pageTexts = [];

        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            let lastY, text = '';
            let currentLine = [];

            // Process each text item
            for (const item of textContent.items) {
                if (item.dir === 'ttb') continue; // Skip vertical text for now

                // Check if we're on a new line
                if (lastY && Math.abs(lastY - item.transform[5]) > 5) {
                    // Add the completed line to text
                    text += currentLine.join(' ') + '\n';
                    currentLine = [];
                }

                currentLine.push(item.str);
                lastY = item.transform[5];
            }

            // Add the last line
            if (currentLine.length > 0) {
                text += currentLine.join(' ');
            }

            // Clean up and add page data
            pageTexts.push({
                page: pageNum,
                text: text.trim()
                    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
                    .replace(/\n\s+/g, '\n')     // Remove spaces after newlines
                    .replace(/\s+\n/g, '\n')     // Remove spaces before newlines
                    .replace(/\n+/g, '\n')       // Replace multiple newlines with single newline
            });

            // Clean up page resources
            await page.cleanup();
        }

        // console.log('pdf page text', pageTexts[0].page)
        // console.log("checking page numbers", pdfImages[0].pageNumber)

        let itemsToInsert = []

        for (const [index, page] of pdfImages.entries()) {
            let pdfObject = {
                pageNumber: page.pageNumber,
                pageImage: page.content.toString('base64'),
                pageText: pageTexts[index].text
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
        console.log(result)


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