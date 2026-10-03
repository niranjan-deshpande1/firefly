import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "./cn";

/** Dense data table. Scrolls inside its own box at narrow widths. */
export function Table({ className, caption, children, ...rest }: TableHTMLAttributes<HTMLTableElement> & { caption: string }) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn("w-full border-collapse type-body-s", className)} {...rest}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn("border-b border-line px-2 py-3 text-start type-label font-normal text-secondary", className)} {...rest} />;
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line px-2 py-3 align-top", className)} {...rest} />;
}

export function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}
