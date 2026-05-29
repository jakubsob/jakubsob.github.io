import * as React from "react";
import { cn } from "@/lib/utils";
import {
  NOTEBOOK_CARD_ACTIONS_CLASSES,
  NOTEBOOK_CARD_DESCRIPTION_BASE_CLASSES,
  NOTEBOOK_CARD_DESCRIPTION_CLAMP_CLASSES,
  NOTEBOOK_CARD_PADDING_CLASSES,
  NOTEBOOK_CARD_ROOT_CLASSES,
  NOTEBOOK_CARD_TITLE_CLASSES,
  NOTEBOOK_CARD_TONE_CLASSES,
  type NotebookCardSize,
  type NotebookCardTone,
} from "@/components/features/notebookCardStyles";

interface NotebookLinkCardProps {
  href?: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  as?: "a" | "div";
  tone?: NotebookCardTone;
  size?: NotebookCardSize;
  titleTag?: "h2" | "h3";
  descriptionClamp?: 2 | 3 | 4 | 5;
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
  titleClassName?: string;
  bodyClassName?: string;
  actionsClassName?: string;
}

export function NotebookLinkCard({
  href,
  title,
  description,
  meta,
  body,
  media,
  actions,
  as = "a",
  tone = "secondary",
  size = "regular",
  titleTag = "h2",
  descriptionClamp,
  external,
  className,
  style,
  titleClassName,
  bodyClassName,
  actionsClassName,
}: NotebookLinkCardProps) {
  const linkProps = external && as === "a"
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const TitleTag = titleTag;
  const clampClass = descriptionClamp
    ? NOTEBOOK_CARD_DESCRIPTION_CLAMP_CLASSES[descriptionClamp]
    : undefined;

  const content = (
    <>
      {media}
      <TitleTag className={cn(NOTEBOOK_CARD_TITLE_CLASSES[size], titleClassName)}>
        {title}
      </TitleTag>

      {body ? (
        <div className={cn("flex-1 min-h-0", bodyClassName)}>{body}</div>
      ) : description ? (
        <p
          className={cn(
            NOTEBOOK_CARD_DESCRIPTION_BASE_CLASSES,
            clampClass,
            bodyClassName,
          )}
        >
          {description}
        </p>
      ) : null}

      {meta}

      {actions ? (
        <div className={cn(NOTEBOOK_CARD_ACTIONS_CLASSES, actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </>
  );

  if (as === "div") {
    return (
      <div
        className={cn(
          NOTEBOOK_CARD_ROOT_CLASSES,
          NOTEBOOK_CARD_TONE_CLASSES[tone],
          NOTEBOOK_CARD_PADDING_CLASSES[size],
          className,
        )}
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        NOTEBOOK_CARD_ROOT_CLASSES,
        NOTEBOOK_CARD_TONE_CLASSES[tone],
        NOTEBOOK_CARD_PADDING_CLASSES[size],
        className,
      )}
      style={style}
      {...linkProps}
    >
      {content}
    </a>
  );
}
