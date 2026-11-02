/** The moving sea behind the islands (styles in IslandMap.css). Decorative only. */
export function Sea() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="sea-sheen" />
    <div className="sea-layer sea-waves-far" />
    <div className="sea-layer sea-waves-near" />
    <div className="sea-layer sea-glints" />
    <div className="sea-layer sea-glints sea-glints-offset" />
  </div>;
}
