import { createApp } from './app.js';
import { loadConfig } from './shared/config.js';

const config = loadConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`ticketing-api listening on http://localhost:${config.port}`);
});
