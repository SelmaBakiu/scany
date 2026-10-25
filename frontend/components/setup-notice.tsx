/**
 * Shown instead of the menu when Supabase is not configured, or when the query
 * fails. A diner should never see this — it is a message to you, during setup.
 */
export function SetupNotice({
  title,
  detail,
  steps,
}: {
  title: string;
  detail?: string;
  steps?: string[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-grow flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-line bg-surface p-7">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">{title}</h1>
        {detail ? <p className="mt-3 text-sm leading-relaxed text-muted">{detail}</p> : null}
        {steps ? (
          <ol className="mt-5 flex flex-col gap-3 text-sm leading-relaxed">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-surface">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <p className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
          Full instructions are in <code className="font-mono">README.md</code>.
        </p>
      </div>
    </main>
  );
}
