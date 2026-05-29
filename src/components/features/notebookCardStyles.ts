export type NotebookCardTone = "secondary" | "background";
export type NotebookCardSize = "regular" | "featured" | "hero";

export const NOTEBOOK_CARD_ROOT_CLASSES =
  "group/post flex h-full flex-col min-w-0 overflow-hidden";

export const NOTEBOOK_CARD_TONE_CLASSES: Record<NotebookCardTone, string> = {
  secondary: "bg-secondary",
  background: "bg-background",
};

export const NOTEBOOK_CARD_PADDING_CLASSES: Record<NotebookCardSize, string> = {
  regular: "p-6",
  featured: "p-6",
  hero: "p-7 md:p-8",
};

export const NOTEBOOK_CARD_TITLE_CLASSES: Record<NotebookCardSize, string> = {
  regular:
    "text-lg font-medium leading-snug mb-2 transition-colors group-hover/post:text-primary line-clamp-2",
  featured:
    "text-xl font-medium leading-tight mb-3 transition-colors group-hover/post:text-primary line-clamp-2",
  hero:
    "text-2xl md:text-3xl font-medium leading-tight mb-4 transition-colors group-hover/post:text-primary line-clamp-2",
};

export const NOTEBOOK_CARD_DESCRIPTION_BASE_CLASSES =
  "text-muted-foreground text-sm leading-relaxed flex-1";

export const NOTEBOOK_CARD_DESCRIPTION_CLAMP_CLASSES: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

export const NOTEBOOK_META_ROW_CLASSES =
  "flex flex-wrap items-center gap-3 text-xs text-muted-foreground/50 mt-auto pt-5";

export const NOTEBOOK_CARD_ACTIONS_CLASSES =
  "flex items-center flex-wrap gap-2 mt-4";
