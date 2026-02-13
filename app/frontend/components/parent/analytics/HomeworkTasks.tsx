import GlassList from "./GlassList";
import Row from "./Row";

interface HomeworkTask {
  subject: string;
  title: string;
  time: string;
}

interface HomeworkTasksProps {
  tasks: HomeworkTask[];
}

export default function HomeworkTasks({ tasks }: HomeworkTasksProps) {
  return (
    <GlassList title="Homework Tasks">
      {tasks.length > 0 ? (
        tasks.map((t, i) => (
          <Row key={i} title={t.subject} sub={t.title} right={t.time} />
        ))
      ) : (
        <div className="text-white/40 text-sm py-2">No upcoming homework</div>
      )}
    </GlassList>
  );
}
