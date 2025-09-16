import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const MONGODB_URI = process.env.MONGODB_URI;

// Define the cached type
interface MongooseGlobalCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Tell TypeScript that global can have this property
declare global {
  var mongooseCache: MongooseGlobalCache;
}

// Use the global cached connection
const cached: MongooseGlobalCache = global.mongooseCache || { conn: null, promise: null };

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  // Save to global so we reuse in dev hot reloads
  if (process.env.NODE_ENV === "development") {
    global.mongooseCache = cached;
  }

  return cached.conn;
}

export default connectToDatabase;
