import mongoose, { Connection } from 'mongoose';

const MONGODB_MENU_URI = process.env.MONGODB_MENU_URI;
const MONGODB_ORDERS_URI = process.env.MONGODB_ORDERS_URI;

if (!MONGODB_MENU_URI) {
  throw new Error(
    'Please define the MONGODB_MENU_URI environment variable inside .env.local'
  );
}
if (!MONGODB_ORDERS_URI) {
  throw new Error(
    'Please define the MONGODB_ORDERS_URI environment variable inside .env.local'
  );
}
interface CachedConnections {
  [key: string]: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

let cachedConnections: CachedConnections = (global as any).mongooseConnections;

if (!cachedConnections) {
  cachedConnections = (global as any).mongooseConnections = {};
}

async function connectToDatabase(uri: string, dbKey: string): Promise<Connection> {
  if (!cachedConnections[dbKey]) {
    cachedConnections[dbKey] = { conn: null, promise: null };
  }

  const cacheEntry = cachedConnections[dbKey];

  if (cacheEntry.conn) {
    return cacheEntry.conn;
  }

  if (!cacheEntry.promise) {
    cacheEntry.promise = mongoose.createConnection(uri).asPromise();
  }

  try {
    cacheEntry.conn = await cacheEntry.promise;
  } catch (e) {
    cacheEntry.promise = null;
    throw e;
  }
  return cacheEntry.conn;
}

export async function getMenuDbConnection(): Promise<Connection> {
  return connectToDatabase(MONGODB_MENU_URI!, 'menuDB');
}

export async function getOrdersDbConnection(): Promise<Connection> {
  return connectToDatabase(MONGODB_ORDERS_URI!, 'ordersDB');
}

export async function dbConnect(): Promise<Connection> {
    return connectToDatabase(MONGODB_MENU_URI!, 'default');
}

export default dbConnect;