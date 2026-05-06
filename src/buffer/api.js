import { config } from "../config.js";

const endpoint = "https://api.buffer.com";

export async function bufferRequest(query, variables = {}) {
  if (!config.buffer.apiKey) {
    throw new Error("Missing BUFFER_API_KEY.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.buffer.apiKey}`
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`Buffer API error: ${message}`);
  }

  return payload.data;
}

export async function getOrganizations() {
  const data = await bufferRequest(`
    query GetOrganizations {
      account {
        organizations {
          id
          name
        }
      }
    }
  `);

  return data.account.organizations;
}

export async function getChannels(organizationId) {
  const data = await bufferRequest(`
    query GetChannels($organizationId: OrganizationId!) {
      channels(input: { organizationId: $organizationId }) {
        id
        name
        displayName
        service
        isQueuePaused
      }
    }
  `, { organizationId });

  return data.channels;
}
