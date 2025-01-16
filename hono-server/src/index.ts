import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import hybrid from './search/hybrid.ts'
import vector from './search/vector.ts'
import generate from './search/generate.ts'

// Initialize Hono app
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello from Hono!')
})

app.route('/search/keyword', hybrid)
app.route('/search/vector', vector)
app.route('/search/generate', generate)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})


export default app