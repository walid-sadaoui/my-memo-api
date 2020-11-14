import * as mongoose from "mongoose";

export default async () => {
  const connection = await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  });
  return connection.connection.db;
};
