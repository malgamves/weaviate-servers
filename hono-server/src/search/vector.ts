import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectToDB } from '../../config/weaviate.ts';
import { type SearchResponse, type Wiki } from '../../types.ts';
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

app.post('/', async (c) => {
  const client = await connectToDB();
  const searchTerm = await c.req.text()

  // console.log("body", searchTerm)

  const wikipedia = client.collections.get<Wiki>("WikipediaM")

  if (searchTerm) {
    try {
      const response = await wikipedia.query.nearImage(searchTerm, {
        limit: 5,
        returnProperties: ["text", "title"] 
      })

      // console.log(response.objects)

      return c.json(response)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        return c.json({
          error: error.message,
        })
      }
    }
  }
  return c.json({
    error: "Please add a query parameter to your request",
  })
})

export default app