import type { CourseUnit } from "../api/units";

export default function UnitSelector({ units, selectedId, onChange }: { units: CourseUnit[]; selectedId: string; onChange: (id: string) => void }) {
  return <label className="block max-w-md text-sm font-bold text-gray-700">
    Choose a unit
    <select value={selectedId} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:outline-2 focus:outline-emerald-600">
      {units.map(unit => <option key={unit.id} value={unit.id} disabled={!unit.allowed}>
        Unit {unit.number}: {unit.title} — {unit.completed ? "✓ Complete" : unit.allowed ? unit.isPlaceholder ? "Coming Soon" : "Available" : `🔒 ${unit.reasons.join(" + ")}`}
      </option>)}
    </select>
  </label>;
}
