import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className={cn("", className)}>
        <CardHeader >
          <CardTitle className="transition-colors">
            {post.data.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {post.data.description}
        </CardContent>
        <CardFooter className="gap-4">
          <FormattedDate date={post.data.pubDate} />
          <div className="flex items-center gap-1 flex-nowrap">
            {post.data.tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.has(tag) ? "secondary" : "ghost"}
                className="uppercase"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="ml-auto uppercase">
            {getReadingTime(post.body)}
          </div>
        </CardFooter>
      </Card>
    </a>
  );
}
