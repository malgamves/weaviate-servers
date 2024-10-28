import express from 'express';
import { connectToDB } from './config/weaviate.js';

const app = express();
const port = 3005

const client = await connectToDB();

app.get('/', async function(req, res, next) {
    var searchTerm = req.query.searchTerm;

    const wikipedia = client.collections.get("Wikipedia")

    try {
        const response = await wikipedia.query.nearText(searchTerm, {
            limit: 5
        })
    
        res.send(response.objects)
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

  