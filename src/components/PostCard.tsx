import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/FormattedDate";

interface PostCardProps {
  post: {
    slug: string;
    data: {
      title: string;
      description: string;
      pubDate: Date;
      tags: string[];
    };
    body: string;
  };
  selectedTags: Set<string>;
  className?: string;
}

export function PostCard({ post, selectedTags, className }: PostCardProps) {
  return (
    <a href={`/blog/${post.slug}/`}>
      <Card className={cn("group hover:shadow-lg transition-shadow duration-300", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-medium text-foreground group-hover:text-primary transition-colors capitalize">
            {post.data.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {post.data.description}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <FormattedDate date={post.data.pubDate} />
            <div className="flex flex-wrap gap-1">
              {post.data.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.has(tag) ? "secondary" : "outline"}
                  className="text-xs uppercase"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="ml-auto text-xs uppercase font-medium">
              {getReadingTime(post.body)}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
