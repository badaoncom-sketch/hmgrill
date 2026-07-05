import Image from "next/image";
import { Utensils } from "lucide-react";

export function MenuImage({
  src,
  alt,
  priority = false,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className="grid aspect-[3/2] place-items-center rounded-md bg-[#17130f0a] text-[#8a7c6d]">
        <Utensils size={28} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-[#17130f0a]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw"
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
