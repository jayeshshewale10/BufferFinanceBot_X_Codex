import path from "node:path";
import { assertPostingConfig, config } from "../config.js";
import { bufferRequest } from "./api.js";

function toPublicImageUrl(imagePath) {
  const normalized = imagePath.replace(/\\/g, "/");
  const marker = "/public/generated/";
  const index = normalized.indexOf(marker);

  if (index === -1) {
    throw new Error(`Image must be inside public/generated for Buffer image posting: ${imagePath}`);
  }

  const relative = normalized.slice(index + marker.length);
  return `${config.buffer.publicImageBaseUrl.replace(/\/$/, "")}/${relative}`;
}

export async function postToBuffer(parts, imagePath) {
  assertPostingConfig();

  const imageUrl = imagePath ? toPublicImageUrl(path.resolve(imagePath)) : undefined;
  const variables = {
    text: parts[0],
    channelId: config.buffer.channelId,
    thread: parts.slice(1).map((text) => ({ text })),
    images: imageUrl ? [{ url: imageUrl }] : []
  };

  const query = `
    mutation CreatePost(
      $text: String!,
      $channelId: ChannelId!,
      $thread: [ThreadedPostInput!],
      $images: [ImageAssetInput!]
    ) {
      createPost(input: {
        text: $text,
        channelId: $channelId,
        schedulingType: automatic,
        mode: shareNow
        assets: { images: $images }
        metadata: { twitter: { thread: $thread } }
      }) {
        ... on PostActionSuccess {
          post {
            id
            text
            dueAt
            assets { id mimeType }
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  let data;
  try {
    data = await bufferRequest(query, variables);
  } catch (error) {
    if (!String(error.message).toLowerCase().includes("posted that one recently")) {
      throw error;
    }

    variables.text = `${variables.text}\n\nFresh angle: ${new Date().toISOString().slice(11, 16)} UTC`;
    data = await bufferRequest(query, variables);
  }
  const result = data.createPost;

  if (result.message && String(result.message).toLowerCase().includes("posted that one recently")) {
    variables.text = `${variables.text}\n\nFresh angle: ${new Date().toISOString().slice(11, 16)} UTC`;
    const retryData = await bufferRequest(query, variables);
    const retryResult = retryData.createPost;
    if (retryResult.message) throw new Error(`Buffer rejected post: ${retryResult.message}`);
    return { ...retryResult.post, imageUrl };
  }

  if (result.message) {
    throw new Error(`Buffer rejected post: ${result.message}`);
  }

  return { ...result.post, imageUrl };
}
