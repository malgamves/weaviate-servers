import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectToDB } from '../../config/weaviate.ts';

const app = new Hono()
const client = await connectToDB();

// Middleware
app.use('*', logger())
app.use('*', cors())

app.get('/', async (c) => {
  const searchTerm = c.req.query("searchTerm");

  const wikipedia = client.collections.get("Wiki")

  if (searchTerm) {
    try {
      const response = await wikipedia.query.hybrid(searchTerm, {
        limit: 5
      })

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