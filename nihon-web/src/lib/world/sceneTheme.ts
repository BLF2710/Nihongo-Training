// How a walking scene looks, after its island's art on the island map (docs/WORLD.md): cherry blossom for the Kana
// island and the path to it, bamboo for Practice, an evening festival for Games, autumn maples for Lessons, a zen
// garden among pines for Review, high on a snowy mountain above the clouds for Fuji ("summit"), and snow over the sea
// for the ferry to it ("mountain"). The village square has none.
export type SceneTheme = "sakura" | "bamboo" | "festival" | "maple" | "zen" | "mountain" | "summit";

/** What lies beyond a walking scene's edges: the woods going on (the paths and the village square), open water (round
 *  an island, and the sea the ferry crosses), or the sea of clouds below Fuji. */
export type Surroundings = "woods" | "water" | "clouds";
