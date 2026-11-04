// How the village is seen in 2.5D: the ground is a plane tipped back from the screen, and everything standing on it
// (people, trees, walls) is a card stood straight up from it.

/** How far the ground is tipped back from facing the screen: 0 is straight down from above, 90 is edge-on. */
export const TILT_DEGREES = 50;
const TILT = TILT_DEGREES * Math.PI / 180;

/** Seen at the tilt, an upright card looks squashed (by the sine of the tilt); stretching it back keeps art its shape. */
const UPRIGHT_STRETCH = 1 / Math.sin(TILT);

/** Stands a card up on the ground from its bottom edge, facing the viewer (needs `transform-origin` at the bottom). */
export const STAND_UP = `rotateX(-90deg) scaleY(${UPRIGHT_STRETCH})`;
/** Stands a card up along the ground's y axis instead, from its bottom-left corner (`transform-origin: 0 100%`). */
export const STAND_UP_ALONG_Y = "rotateZ(90deg) rotateX(-90deg)";

/** Where the traveller is held on screen (from the top), and how strong the perspective is (× the screen height). */
export const FOCUS_FROM_TOP = 0.6;
export const PERSPECTIVE_PER_HEIGHT = 1.8;

/** How many px of ground fit between the focus and a point `screenOffset` px below it (negative: above), in perspective. */
export function groundDistance(screenOffset: number, perspective: number): number {
  return screenOffset * perspective / (perspective * Math.cos(TILT) + screenOffset * Math.sin(TILT));
}
