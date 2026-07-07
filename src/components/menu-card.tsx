import Image from "next/image";
import Link from "next/link";
import { Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MenuCard({
  item,
  priority = false,
}: {
  item: MenuItem;
  priority?: boolean;
}) {
  return (
    <Link href={`/menu/${item.id}`} className="hm-link-focus group block h-full">
      <article className="hm-card-hover flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
        <div className="hm-image-zoom relative aspect-[4/3] overflow-hidden bg-[var(--hm-card)]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-[var(--hm-subtext)]">
              <Utensils size={28} aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <Badge tone={item.featured ? "amber" : "neutral"} className="w-fit">
            {item.featured ? "대표" : item.category}
          </Badge>
          <h3 className="hm-card-title">{item.name}</h3>
          <p className="hm-caption min-h-12 text-[var(--hm-subtext)]">
            {item.description}
          </p>
          <p className="mt-auto pt-1 text-[19px] font-bold leading-none text-[var(--hm-primary)]">
            {formatCurrency(item.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
