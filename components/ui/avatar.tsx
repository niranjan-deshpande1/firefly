import { cn } from "./cn";

type AvatarProps = { name: string; src?: string | null; size?: 24 | 44 | 96; className?: string };

const SIZE = { 24: "size-6", 44: "size-11", 96: "size-24" } as const;

/** 1:1 image with pill radius; fallback is the person's initials, never a stock face (manual 7.6). */
export function Avatar({ name, src, size = 44, className }: AvatarProps) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toLowerCase();
  return (
    <span className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-pill bg-raised type-label text-primary", SIZE[size], className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size} height={size} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
