import type { LucideIcon, LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "strokeWidth"> & { icon: LucideIcon; size?: 16 | 24 };

/** Lucide at the locked 1.5 stroke (manual 6.1). Decorative by default; the labeled parent owns meaning. */
export function Icon({ icon: Glyph, size = 16, ...rest }: IconProps) {
  return <Glyph aria-hidden="true" focusable="false" size={size} strokeWidth={1.5} {...rest} />;
}
