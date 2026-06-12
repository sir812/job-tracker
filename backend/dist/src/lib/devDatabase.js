"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureLocalDevDatabase = ensureLocalDevDatabase;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const net_1 = __importDefault(require("net"));
const path_1 = __importDefault(require("path"));
const SQLITE_SCHEMA = 'prisma/schema.sqlite.prisma';
const SQLITE_URL = 'file:./prisma/dev.db';
const backendRoot = path_1.default.resolve(__dirname, '../..');
const sqliteDbPath = path_1.default.join(backendRoot, 'prisma', 'dev.db');
const prismaCli = path_1.default.join(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');
function runPrisma(args) {
    const result = (0, child_process_1.spawnSync)(process.execPath, [prismaCli, ...args], {
        cwd: backendRoot,
        stdio: 'inherit',
        env: process.env,
    });
    if (result.status !== 0) {
        throw new Error(`prisma ${args.join(' ')} failed`);
    }
}
function isTcpPortOpen(host, port) {
    return new Promise((resolve) => {
        const socket = net_1.default.connect({ host, port });
        socket.setTimeout(1500);
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.once('error', () => resolve(false));
    });
}
function getPostgresHostPort(url) {
    try {
        const normalized = url.replace(/^prisma\+postgres:/, 'postgres:');
        const parsed = new URL(normalized);
        if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
            return null;
        }
        return {
            host: parsed.hostname,
            port: parsed.port ? Number(parsed.port) : 5432,
        };
    }
    catch {
        return null;
    }
}
async function isPostgresReachable(url) {
    const target = getPostgresHostPort(url);
    if (!target) {
        return true;
    }
    if (target.host !== 'localhost' && target.host !== '127.0.0.1') {
        return true;
    }
    return isTcpPortOpen(target.host, target.port);
}
function ensureSqliteDevDatabase() {
    process.env.DATABASE_URL = SQLITE_URL;
    if (!fs_1.default.existsSync(sqliteDbPath)) {
        console.log('[dev-db] Creating SQLite database at prisma/dev.db');
    }
    runPrisma(['generate', '--schema', SQLITE_SCHEMA]);
    runPrisma(['db', 'push', '--schema', SQLITE_SCHEMA, '--skip-generate']);
    console.log('[dev-db] SQLite database ready');
}
async function ensureLocalDevDatabase() {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (process.env.USE_SQLITE_DEV === 'true') {
        ensureSqliteDevDatabase();
        return;
    }
    if (process.env.FORCE_POSTGRES_DEV === 'true') {
        return;
    }
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        ensureSqliteDevDatabase();
        return;
    }
    if (await isPostgresReachable(databaseUrl)) {
        return;
    }
    console.warn('[dev-db] Local Postgres is not running; using SQLite at prisma/dev.db (run `npm run dev:db` for Postgres)');
    ensureSqliteDevDatabase();
}
