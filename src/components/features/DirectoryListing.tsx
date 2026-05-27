import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DirectoryItem {
  name: string;
  type: string;
  path: string;
  readme?: {
    title: string;
    description: string;
    titleHtml: string;
    descriptionHtml: string;
    fullContent: string;
  };
}

interface DirectoryListingProps {
  directories: DirectoryItem[];
}

export function DirectoryListing({ directories }: DirectoryListingProps) {
  if (directories.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to Load Repository Data</AlertTitle>
        <AlertDescription>
          There was an error fetching the repository contents. This could be
          due to GitHub API rate limits or network issues.
          <div className="mt-4">
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
              asChild
            >
              <a
                href="https://github.com/jakubsob/r-tests-gallery"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                Visit GitHub Repository
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {directories.map((dir) => (
        <Card
          key={dir.name}
          className="hover:shadow-md transition-shadow group"
        >
          <CardHeader>
            <CardTitle
              className="capitalize"
              dangerouslySetInnerHTML={{
                __html: dir.readme?.titleHtml || dir.name.replace(/-/g, " "),
              }}
            />
            <CardDescription
              className="group-hover:line-clamp-none transition-all duration-300 line-clamp-5"
              dangerouslySetInnerHTML={{
                __html: dir.readme?.descriptionHtml || "",
              }}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
              >
                <a href={`/r-tests-gallery/${dir.name}`}>
                  Browse
                </a>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
              >
                <a
                  href={`https://github.com/jakubsob/r-tests-gallery/tree/main/${dir.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  Open on GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
