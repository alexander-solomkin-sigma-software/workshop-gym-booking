import { createApp } from './app.js';
import { defaultDbPath, openDb } from './db.js';

const PORT = Number(process.env.PORT ?? 3001);

const db = openDb(defaultDbPath());
const app = createApp(db);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Gym Booking API listening on http://localhost:${PORT}`);
});
