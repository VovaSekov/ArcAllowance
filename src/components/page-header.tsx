export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100/80">{eyebrow}</p> : null}
        <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{description}</p>
      </div>
      {action ? <div className="flex shrink-0">{action}</div> : null}
    </div>
  );
}
