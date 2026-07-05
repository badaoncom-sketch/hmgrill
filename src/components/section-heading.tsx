export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="hm-serif mt-4 text-3xl font-bold tracking-normal text-[var(--hm-text)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-5 text-base leading-7 text-[var(--hm-subtext)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
