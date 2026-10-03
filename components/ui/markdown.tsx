import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "./cn";

// No images: an external image in a check-in or story would tell its author when, and from where, it was read.
const SCHEMA = { ...defaultSchema, tagNames: (defaultSchema.tagNames ?? []).filter((t) => t !== "img") };

/** Builder-authored Markdown, sanitized and never case-transformed. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-ff", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, SCHEMA]]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
