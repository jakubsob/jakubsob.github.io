import { Card, CardTitle, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle className="group-hover:text-primary transition-colors">
          <div className="flex items-center gap-2">
          {title}
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
          {description}
      </CardContent>
      <CardFooter className="gap-4">
        <Badge className="uppercase">
          {actionability}
        </Badge>
        <Badge className="uppercase">
          {group}
        </Badge>
        <Badge className="uppercase">
          {format}
        </Badge>
      </CardFooter>
    </Card>
  );
}
