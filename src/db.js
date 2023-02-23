import mongoose from "mongoose";

mongoose.set("strictQuery", true);

mongoose.connect(process.env.MongoUrl);

const db = mongoose.connection;

const handleDBerror = (error) => {
  console.log("❌ DB connect Error", error);
};
const handleDBConnect = () => {
  console.log("✅ Connecting DB ");
};

db.on("error", handleDBerror);
db.once("open", handleDBConnect);
