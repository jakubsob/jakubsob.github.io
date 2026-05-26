import type { ShikiTransformer } from "shiki";

/**
 * Shiki transformer that reads `# [!code step:N]` notation and adds
 * data-step="N" + opacity:0 initial state to those lines so JS can
 * animate them in sequence. The notation comment is removed from output.
 */
export function transformerStepAnimation(): ShikiTransformer {
  const NOTATION = /\s*#\s*\[!code step:(\d+)\]/;

  return {
    name: "step-animation",
    line(node, line) {
      const lineEl = node;
      // Collect all text content of this line to check for notation
      let notationMatch: RegExpMatchArray | null = null;
      let notationTokenIndex = -1;

      const tokens = lineEl.children;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type !== "element") continue;
        const text = token.children
          .filter((c) => c.type === "text")
          .map((c) => (c as { value: string }).value)
          .join("");
        const match = text.match(NOTATION);
        if (match) {
          notationMatch = match;
          notationTokenIndex = i;
          break;
        }
      }

      if (!notationMatch) return;

      const stepNum = notationMatch[1];

      // Add data-step attribute and initial animation state
      lineEl.properties["data-step"] = stepNum;
      lineEl.properties["style"] =
        "opacity:0;transition:opacity 0.35s ease-out,background-color 0.1s ease-out";

      // Remove the notation token from the rendered output
      if (notationTokenIndex !== -1) {
        const token = tokens[notationTokenIndex];
        if (token.type === "element") {
          // Strip the notation from the token's text content
          const textNodes = token.children.filter((c) => c.type === "text");
          for (const textNode of textNodes) {
            (textNode as { value: string }).value = (
              textNode as { value: string }
            ).value.replace(NOTATION, "");
          }
          // Remove token entirely if it's now empty
          const remaining = token.children
            .filter((c) => c.type === "text")
            .map((c) => (c as { value: string }).value)
            .join("")
            .trim();
          if (!remaining) {
            tokens.splice(notationTokenIndex, 1);
          }
        }
      }
    },
  };
}
