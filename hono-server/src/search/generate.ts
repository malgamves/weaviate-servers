import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { connectToDB } from '../../config/weaviate.ts';

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

app.get('/', async (c) => {
  const client = await connectToDB();
  const searchTerm = c.req.query("searchTerm");
  const prompt = c.req.query("prompt") // todo
  // add generative module to collection 


  const wikipedia = client.collections.get("WikipediaM")

  if (searchTerm) {
    try {
      
      const response = await wikipedia.generate.hybrid(searchTerm,  {
        groupedTask: `you are a primary school teacher which of these is the most relevant? `,
        
      }, {limit: 5})

      console.log(response.generated)
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