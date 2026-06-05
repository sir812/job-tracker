import { spawnSync } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';

const SQLITE_SCHEMA = 'prisma/schema.sqlite.prisma';
const SQLITE_URL = 'file:./prisma/dev.db';
const backendRoot = path.resolve(__dirname, '../..');
const sqliteDbPath = path.join(backendRoot, 'prisma', 'dev.db');
const prismaCli = path.join(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');

function runPrisma(args: string[]) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`prisma ${args.join(' ')} failed`);
  }
}

function isTcpPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
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

function getPostgresHostPort(url: string): { host: string; port: number } | null {
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
  } catch {
    return null;
  }
}

async function isPostgresReachable(url: string): Promise<boolean> {
  const target = getPostgresHostPort(url);
  if (!target) {
    return true;
  }
  if (target.host !== 'localhost' && target.host !== '127.0.0.1') {
    return true;
  }
  return isTcpPortOpen(target.host, target.port);
}

function ensureSqliteDevDatabase(): void {
  process.env.DATABASE_URL = SQLITE_URL;

  if (!fs.existsSync(sqliteDbPath)) {
    console.log('[dev-db] Creating SQLite database at prisma/dev.db');
  }

  runPrisma(['generate', '--schema', SQLITE_SCHEMA]);
  runPrisma(['db', 'push', '--schema', SQLITE_SCHEMA, '--skip-generate']);
  console.log('[dev-db] SQLite database ready');
}

export async function ensureLocalDevDatabase(): Promise<void> {
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

  console.warn(
    '[dev-db] Local Postgres is not running; using SQLite at prisma/dev.db (run `npm run dev:db` for Postgres)',
  );
  ensureSqliteDevDatabase();
}
