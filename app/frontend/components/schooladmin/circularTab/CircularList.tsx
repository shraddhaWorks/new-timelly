import { CircularRow } from "./types";
import CircularCard from "./circularCard";

export default function CircularList({
  circulars,
}: {
  circulars: CircularRow[];
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {circulars.map((c) => (
        <CircularCard key={c.id} c={c} />
      ))}
    </div>
  );
}
