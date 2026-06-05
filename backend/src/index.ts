import './loadEnv';
import { ensureLocalDevDatabase } from './lib/devDatabase';

async function main() {
  await ensureLocalDevDatabase();

  // Load app after DATABASE_URL is finalized (dynamic import needs extension under ts-node ESM).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const app = require('./app').default;

  const port = Number(process.env.PORT ?? 4000);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on port ${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
