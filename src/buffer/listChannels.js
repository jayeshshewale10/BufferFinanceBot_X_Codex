import { loadEnv } from "../utils/env.js";
import { getChannels, getOrganizations } from "./api.js";

loadEnv();

const organizations = await getOrganizations();

for (const organization of organizations) {
  console.log(`\n${organization.name} (${organization.id})`);
  const channels = await getChannels(organization.id);

  for (const channel of channels) {
    const label = channel.displayName || channel.name;
    console.log(`- ${label} | ${channel.service} | ${channel.id}`);
  }
}
