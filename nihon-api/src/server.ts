import { createApp } from "./app";
import { seedGameScoresTable } from "./services/games.seed";

const PORT = 5000;

// Auto-create game scores table on startup
seedGameScoresTable().catch(console.error);

createApp().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
