import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectToDB } from '../config/weaviate.ts';

const app = new Hono()
const client = await connectToDB();

// Middleware
app.use('*', logger())
app.use('*', cors())


// Initialize Hono app
app.get('/', (c) => {
  return c.text('Hello from Hono!')
})

app.get('/search', async (c) => {
  var searchTerm = c.req.query("searchTerm");

  const wikipedia = client.collections.get("Wikipediaaa")

  if (searchTerm) {
    try {
    const response = await wikipedia.query.nearText(searchTerm, {
      limit: 5
    })

    return c.json(response.objects)
  } catch (error) {
    if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    return c.json({
      error: error.message,
    })
  }
  }
}
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})


export default app