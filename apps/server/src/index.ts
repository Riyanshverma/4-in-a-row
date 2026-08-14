import { app } from "./app/app"

async function startServer() {
  try {
    await app.listen({ port: Bun.env.PORT, host: '0.0.0.0' }, (_err, address) => {
      console.info(`Server listening on ${address}`);
    });
  } catch (error) {
    console.error(`An error occurred while starting the server: ${error}`);
    process.exit(1);
  }
}

startServer()
