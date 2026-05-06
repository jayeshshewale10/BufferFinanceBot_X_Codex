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

function duplicateTextVariant(text, attempt = 1) {
  const variants = [
    "Different lens: the headline is only step one. The real move is in oil, INR, inflation and margins.",
    "India angle today: crude is the transmission belt. If oil stays hot, inflation and sector margins feel it first.",
    "Investor note today: do not stop at the news. Track who pays if this risk lasts another month.",
    "Fresh market map: prices move first, explanations arrive later. Watch oil, currency and margins."
  ];
  const variant = variants[(Date.now() + attempt) % variants.length];
  const firstLine = attempt === 1 ? "Markets are watching this closely:" : "This can move your money:";
  const marker = new Date().toISOString().slice(11, 16);
  const candidate = `${firstLine}\n\n${variant}\n\nSignal time: ${marker} UTC`;

  return candidate.length <= 280 ? candidate : `${firstLine}\n\n${variant}`;
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

    variables.text = duplicateTextVariant(variables.text, 1);
    data = await bufferRequest(query, variables);
  }
  const result = data.createPost;

  if (result.message && String(result.message).toLowerCase().includes("posted that one recently")) {
    variables.text = duplicateTextVariant(parts[0], 2);
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
