import { createApp } from "./app";
import { config } from "./config/env";
import { seedGameScoresTable } from "./services/games.seed";

const PORT = config().port;

// Auto-create game scores table on startup
seedGameScoresTable().catch(console.error);

createApp().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
