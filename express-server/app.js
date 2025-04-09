import express from 'express';
import { connectToDB } from './config/weaviate.js';
import cors from 'cors'
import insertMedia from './routes/insertMedia.js';
import createCollection from './routes/createCollection.js';

const app = express();
const port = 3005

app.use(cors())
app.use(express.json({ limit: '50mb' })); // Adjust limit based on your needs
app.use('/api', insertMedia)
app.use('/api', createCollection)


const client = await connectToDB();

app.get('/search', async function(req, res, next) {
    var searchTerm = req.query.searchTerm;

    const wikipedia = client.collections.get("PDFLibrary")

    try {
        const response = await wikipedia.generate.nearText(searchTerm,{
          groupedTask: `you are a chat assistant to talk with pdf that the user uploads.
          
          you must be friendly conversation and concise. only answer questions if asked.
          if you cannot possibly answer the question, kindly decline to answer.

          here is the users question:  ${searchTerm}`,
          groupedProperties: ["pageText"],
        }, {
            autoLimit: 2,
            targetVector: ["image_vector", "text_vector"],
            includeVector: true,
        })
    
        res.send(response)
        // console.log()
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
  })



app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

  