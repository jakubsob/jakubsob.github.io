import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
  actionability: string;
  format: string;
  group: string;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  href,
  actionability,
  format,
  group,
  className,
}: ResourceCardProps) {
  const handleClick = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-shadow duration-300 cursor-pointer w-full max-w-[65ch]",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-foreground group-hover:text-primary transition-colors capitalize flex items-center gap-2">
          {title}
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs uppercase">
            {actionability}
          </Badge>
          <Badge variant="outline" className="text-xs uppercase">
            {group}
          </Badge>
          <Badge variant="outline" className="text-xs uppercase">
            {format}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
