import { Reactions } from "@/service/types";

interface PostReactionsProps {
  reactions: Reactions;
}

interface ReactionCountProps {
  icon: string;
  count: number;
  singularLabel: string;
  pluralLabel: string;
  testId: string;
}

function ReactionCount({
  icon,
  count,
  singularLabel,
  pluralLabel,
  testId,
}: ReactionCountProps) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
      <span aria-hidden="true">{icon}</span>
      <span data-testid={testId} style={{ fontWeight: "600" }}>
        {count}
      </span>
      <span>{count === 1 ? singularLabel : pluralLabel}</span>
    </span>
  );
}

export default function PostReactions({ reactions }: PostReactionsProps) {
  return (
    <div
      aria-label="Reações do post"
      role="group"
      style={{
        display: "flex",
        gap: "1rem",
        color: "var(--foreground)",
        opacity: 0.8,
      }}
    >
      <ReactionCount
        icon="👍"
        count={reactions.likes}
        singularLabel="curtida"
        pluralLabel="curtidas"
        testId="post-likes"
      />
      <ReactionCount
        icon="👎"
        count={reactions.dislikes}
        singularLabel="descurtida"
        pluralLabel="descurtidas"
        testId="post-dislikes"
      />
    </div>
  );
}
