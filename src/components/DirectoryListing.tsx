import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExternalLink, Github, AlertCircle } from "lucide-react";

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
              className="text-red-700 border-red-200 hover:bg-red-100"
              asChild
            >
              <a
                href="https://github.com/jakubsob/r-tests-gallery"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
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
          className="hover:shadow-md transition-shadow group border-slate-200"
        >
          <CardHeader>
            <CardTitle
              className="text-lg font-medium text-slate-900 capitalize"
              dangerouslySetInnerHTML={{
                __html: dir.readme?.titleHtml || dir.name.replace(/-/g, " "),
              }}
            />
            <CardDescription
              className="text-slate-500 group-hover:line-clamp-none transition-all duration-300 line-clamp-5"
              dangerouslySetInnerHTML={{
                __html: dir.readme?.descriptionHtml || "Testing example project.",
              }}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <Button
                className="bg-sky-700 hover:bg-default text-white"
                size="sm"
                asChild
              >
                <a href={`/r-tests-gallery/${dir.name}`}>
                  Browse
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://github.com/jakubsob/r-tests-gallery/tree/main/${dir.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
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
