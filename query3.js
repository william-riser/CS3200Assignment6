import { MongoClient } from "mongodb";
import { createClient } from "redis";

console.log("Connecting to Redis...");
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
console.log("Connected to Redis.");

const countUsers = async () => {
  const client = await MongoClient.connect("mongodb://localhost:27017/");
  const coll = client.db("ieeevisTweets").collection("tweet");
  const tweets = await coll.find().toArray();

  for (const tweet of tweets) {
    await redisClient.SADD("users", tweet.user.screen_name);
  }

  await client.close();
  return await redisClient.SCARD("users");
};

const numUsers = await countUsers();

console.log(`There are ${numUsers} users`);

await redisClient.disconnect();
console.log("Disconnected from Redis.");
