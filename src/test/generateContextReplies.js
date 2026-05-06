import { buildContextReplies } from "../content/contextReply.js";

const postText = process.env.TARGET_POST_TEXT || process.argv.slice(2).join(" ");

if (!postText.trim()) {
  throw new Error("No post text found. Copy a post to clipboard or pass text to the script.");
}

const result = buildContextReplies(postText);

console.log("\nTARGET POST");
console.log(postText.trim());
console.log(`\nDetected lane: ${result.lane}`);
console.log(`Detected topic: ${result.topic}`);
console.log("\nCONTEXTUAL REPLIES");

result.replies.forEach((reply, index) => {
  console.log(`\n${index + 1}. ${reply}`);
});
