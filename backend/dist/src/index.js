"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv");
const devDatabase_1 = require("./lib/devDatabase");
async function main() {
    await (0, devDatabase_1.ensureLocalDevDatabase)();
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
