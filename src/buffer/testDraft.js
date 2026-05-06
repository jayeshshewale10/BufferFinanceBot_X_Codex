import { config } from "../config.js";
import { bufferRequest } from "./api.js";

if (!config.buffer.channelId) {
  throw new Error("Missing BUFFER_CHANNEL_ID. Run scripts/buffer-channels.ps1 and add the X/Twitter channel ID to .env.");
}

const text = `Buffer API test draft.\n\nIf you see this in Buffer drafts, the bot connection works.\n\nCreated: ${new Date().toISOString()}`;

const data = await bufferRequest(`
  mutation CreateDraft($text: String!, $channelId: ChannelId!) {
    createPost(input: {
      text: $text,
      channelId: $channelId,
      schedulingType: automatic,
      mode: addToQueue,
      saveToDraft: true
    }) {
      ... on PostActionSuccess {
        post { id text }
      }
      ... on MutationError {
        message
      }
    }
  }
`, {
  text,
  channelId: config.buffer.channelId
});

const result = data.createPost;
if (result.message) throw new Error(`Buffer rejected draft: ${result.message}`);

console.log(`Buffer draft created: ${result.post.id}`);
console.log("Check your Buffer Drafts. This did not publish to X.");
