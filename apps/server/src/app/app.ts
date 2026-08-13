import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify"

const app: FastifyInstance = Fastify({
  logger: true,
})

app.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return _reply.send({ status: "ok" })
})

app.ready((err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})

export { app }
