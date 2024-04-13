import { MongoClient } from "mongodb";
import { createClient } from "redis";

console.log("Connecting to Redis...");
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
console.log("Connected to Redis.");

const userTweets = async () => {
  const client = await MongoClient.connect("mongodb://localhost:27017/");
  const tweets = client.db("ieeevisTweets").collection("tweet");

  const cursor = await tweets.find().toArray();

  for (const tweet of cursor) {
    const user = tweet.user.screen_name;
    const tweetString = JSON.stringify(tweet);
    await redisClient.LPUSH("tweets:" + user, tweet.id_str);
    await redisClient.HSET("tweet:" + tweet.id, {tweet:tweetString});
  }
  await client.close();
};

await userTweets();

await redisClient.disconnect();
console.log("Disconnected from Redis.");
