import { buildReplyPlan } from "../content/replyPlan.js";

const plan = buildReplyPlan();

console.log("\nREPLY WINDOWS");
for (const item of plan.schedule) {
  console.log(`- ${item.time}: ${item.action}`);
}

console.log("\nHIGH-IMPACT TARGETS");
for (const target of plan.targets) {
  console.log(`- ${target.name} ${target.handle}`);
  console.log(`  Lane: ${target.lane}`);
  console.log(`  Reply when: ${target.trigger}`);
}

console.log("\nREADY-TO-PASTE REPLIES");
for (const [lane, replies] of Object.entries(plan.replies)) {
  console.log(`\n${lane.toUpperCase()}`);
  replies.forEach((reply, index) => {
    console.log(`${index + 1}. ${reply}`);
  });
}
