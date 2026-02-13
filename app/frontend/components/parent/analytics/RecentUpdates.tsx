import GlassList from "./GlassList";
import Row from "./Row";

interface Update {
  title: string;
  date: string;
}

interface RecentUpdatesProps {
  updates: Update[];
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
  return (
    <GlassList title="Recent Updates">
      {updates.length > 0 ? (
        updates.map((x, i) => (
          <Row key={i} title={x.title} right={x.date} />
        ))
      ) : (
        <div className="text-white/40 text-sm py-2">No recent updates</div>
      )}
    </GlassList>
  );
}
