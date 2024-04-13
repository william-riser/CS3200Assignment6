import { MongoClient } from "mongodb";
import { createClient } from "redis";

console.log("Connecting to Redis...");
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
console.log("Connected to Redis.");

const countFavorites = async () => {
  await redisClient.SET("favoriteSum", "0");

  const client = await MongoClient.connect("mongodb://localhost:27017/");
  const coll = client.db("ieeevisTweets").collection("tweet");
  const tweets = await coll.find().toArray();

  for (const tweet of tweets) {
    await redisClient.INCRBY("favoriteSum", tweet.favorite_count);
  }

  await client.close();
  return await redisClient.GET("favoriteSum");
};

const favoriteSum = await countFavorites();

console.log(`The sum of favorites is ${favoriteSum}`);

await redisClient.disconnect();
console.log("Disconnected from Redis.");
