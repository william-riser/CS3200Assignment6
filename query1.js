import { MongoClient } from "mongodb";
import { createClient } from "redis";

console.log("Connecting to Redis...");
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
console.log("Connected to Redis.");

const countTweets = async () => {
  await redisClient.SET("tweetCount", "0");
  const client = await MongoClient.connect("mongodb://localhost:27017/");

  const coll = client.db("ieeevisTweets").collection("tweet");
  const tweets = await coll.find().toArray();


  for (const tweet of tweets) {
    await redisClient.INCR("tweetCount");
  }
  await client.close();

  return await redisClient.GET("tweetCount");
};
const numTweets = await countTweets();

console.log(`There were ${numTweets} tweets`)

await redisClient.disconnect();
console.log("Disconnected from Redis.");
