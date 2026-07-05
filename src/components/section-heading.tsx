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
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B13A1E]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-3xl font-bold tracking-normal text-[#17130f] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[#5f554a]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
