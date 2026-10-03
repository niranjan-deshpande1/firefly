import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "./cn";

/** Builder-authored Markdown, sanitized and never case-transformed. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-ff", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
