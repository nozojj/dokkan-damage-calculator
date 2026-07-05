export function SourceAttributions({
  items,
}: {
  items: ({ id: string; name: string; sourceUrl: string | null } | null)[];
}) {
  const withSource = items.filter(
    (item): item is { id: string; name: string; sourceUrl: string } => !!item?.sourceUrl
  );

  if (withSource.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
      {withSource.map((item) => (
        <p key={item.id} className="text-xs text-zinc-500 dark:text-zinc-400">
          出典:{" "}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {item.name} - Dragon Ball Z Dokkan Battle Wiki
          </a>
        </p>
      ))}
    </div>
  );
}
