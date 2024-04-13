import { MongoClient } from "mongodb";
import { createClient } from "redis";

console.log("Connecting to Redis...");
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
console.log("Connected to Redis.");

const leaderboard = async () => {
  await redisClient.DEL("leaderboard");
  const client = await MongoClient.connect("mongodb://localhost:27017/");
  const coll = client.db("ieeevisTweets").collection("tweet");
  const tweets = await coll.find().toArray();

  for (const tweet of tweets) {
    await redisClient.ZINCRBY("leaderboard", 1, tweet.user.screen_name);
  }

  const leaderboard = await redisClient.ZRANGE("leaderboard", 0, -1, {
    REV: true,
  });

  await client.close();
  for (let i = 0; i < 10; i++) {
    const numTweets = await redisClient.ZSCORE("leaderboard", leaderboard[i]);
    console.log(`${i + 1}. ${leaderboard[i]}: ${numTweets}`);
  }
};

await leaderboard();

await redisClient.disconnect();
console.log("Disconnected from Redis.");
