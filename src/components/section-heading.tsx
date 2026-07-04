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
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-3xl font-bold tracking-normal text-neutral-950 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-neutral-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
