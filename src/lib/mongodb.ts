import mongoose, { Connection } from 'mongoose';

const MONGODB_MENU_URI = process.env.MONGODB_MENU_URI; // For 'Menu' DB (or your primary DB)
const MONGODB_ORDERS_URI = process.env.MONGODB_ORDERS_URI; // For 'orders' DB

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
    cacheEntry.promise = null; // Reset promise on error so retry can happen
    throw e;
  }
  return cacheEntry.conn;
}

// Connection for Menu Items (uses MONGODB_MENU_URI)
export async function getMenuDbConnection(): Promise<Connection> {
  return connectToDatabase(MONGODB_MENU_URI!, 'menuDB');
}

// Connection for Orders (uses MONGODB_ORDERS_URI)
export async function getOrdersDbConnection(): Promise<Connection> {
  return connectToDatabase(MONGODB_ORDERS_URI!, 'ordersDB');
}

// Original dbConnect for default mongoose connection (if still needed for MenuItem model as is)
// This assumes MenuItem model uses the global mongoose.connect() implicitly.
// For clarity, it's better if MenuItem also explicitly uses getMenuDbConnection.

let cached: any = (global as any).mongooseDefault; // Separate cache for the default connection

if (!cached) {
  cached = (global as any).mongooseDefault = { conn: null, promise: null };
}

export async function dbConnect() { // This will connect to MONGODB_MENU_URI by default if you rename MONGODB_URI to MONGODB_MENU_URI
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    // Ensure this uses the correct URI for the "default" connection, e.g., MONGODB_MENU_URI
    cached.promise = mongoose.connect(MONGODB_MENU_URI!).then((mongooseInstance) => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
