import { app } from "./app.js";
import { config } from "./config.js"
import { checkDb } from "./db/index.js";

const port = config.port;

await checkDb();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
