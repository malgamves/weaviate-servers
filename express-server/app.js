import express from 'express';
import { connectToDB } from './config/weaviate.js';
import cors from 'cors'


const app = express();
const port = 3005
app.use(cors())

const client = await connectToDB();

app.get('/search', async function(req, res, next) {
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

  