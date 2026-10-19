import { app } from "./app.js";
import { config } from "./config.js"
import { checkDb, initSchema } from "./db/index.js";

await checkDb();
await initSchema();

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
