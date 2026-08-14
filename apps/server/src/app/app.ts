import fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"

const app: FastifyInstance = fastify().withTypeProvider<ZodTypeProvider>()

app.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return _reply.status(200).send(`Server running at ${_request.host}`)
})

app.ready((err) => {
  if (err) {
    console.error(`Error loading plugins: ${err.message}`)
    process.exit(1)
  }
})

export { app }
