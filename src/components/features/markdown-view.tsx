import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({
  content,
  plainLinks = false,
}: {
  content: string;
  /** Renderiza links como texto simples, sem âncoras clicáveis (usado no PDF). */
  plainLinks?: boolean;
}) {
  return (
    <div className="markdown-view">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={
          plainLinks
            ? {
                a: ({ children }) => <>{children}</>,
              }
            : {
                a: ({ node, ...props }) => {
                  void node;
                  return <a {...props} target="_blank" rel="noreferrer" />;
                },
              }
        }
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
