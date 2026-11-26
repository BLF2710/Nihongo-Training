// Keeps the last island scene built, set aside rather than thrown away when its page closes, so coming back to the
// island (from a building's page, or a link a villager gave) shows it at once instead of building it all again. Only
// one is kept: going on to another island lets the old one go.

/** Something that holds on to things (a 3D scene, its GPU memory) until it's let go of. */
export type Disposable = { dispose(): void };

/** A scene being opened: the scene, and the promise of it having loaded. */
export type Opening<T> = { scene: T; loading: Promise<void> };

type Kept<T> = Opening<T> & { key: string; hasLoaded: boolean };

export class SceneKeeper<T extends Disposable> {
  private kept: Kept<T> | null = null;

  /** The scene kept under `key`; if there's none, any other is let go and the one `open` opens is kept under it.
   *  One that fails to load isn't kept, so the next visit tries again. */
  claim(key: string, open: () => Opening<T>): Opening<T> {
    if (this.kept?.key === key) return this.kept;
    this.release();
    const kept: Kept<T> = { ...open(), key, hasLoaded: false };
    this.kept = kept;
    void kept.loading.then(
      () => { kept.hasLoaded = true; },
      () => { if (this.kept === kept) this.release(); },
    );
    return kept;
  }

  /** Whether the scene kept under `key` has finished loading (so it can be shown without a loading notice). */
  hasLoaded(key: string): boolean {
    return this.kept?.key === key && this.kept.hasLoaded;
  }

  /** Lets go of the kept scene, if any. */
  release(): void {
    this.kept?.scene.dispose();
    this.kept = null;
  }
}
