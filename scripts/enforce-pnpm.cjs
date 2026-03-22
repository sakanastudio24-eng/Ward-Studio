const userAgent = process.env.npm_config_user_agent || "";

if (!userAgent.includes("pnpm/")) {
  console.error("This repo uses pnpm only. Run pnpm install and use pnpm for dependency changes.");
  process.exit(1);
}
