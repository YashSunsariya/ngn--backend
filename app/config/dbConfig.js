import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");

    const db = cached.conn.connection.db;
    const indexes = await db.collection("products").indexes();
    const skuIndex = indexes.find((i) => i.key && i.key.sku === 1);
    if (skuIndex) {
      await db.collection("products").dropIndex(skuIndex.name);
      console.log("Dropped sku_1 index from products");
    }
    await db.collection("products").updateMany(
      { sku: { $exists: true } },
      { $unset: { sku: "" } }
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};
