import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Settings2, CheckCircle } from "lucide-react";
import {
  formatBoldText,
  formatItalicText,
  formatCodeText,
  formatMarkdownText
} from "./LinkedInTextFormatterUtils";

interface FormatterConfig {
  bulletReplacement: string;
  boldFont: string;
  italicFont: string;
  headingPrefix: string;
  codeStyle: string;
}

const defaultConfig: FormatterConfig = {
  bulletReplacement: "→",
  boldFont: "bold", // Use "bold" as placeholder to trigger Unicode mapping
  italicFont: "italic", // Use "italic" as placeholder to trigger Unicode mapping
  headingPrefix: "",
  codeStyle: "monospace" // Use "monospace" as placeholder to trigger Unicode mapping
};

export function LinkedInTextFormatter() {
  const [markdownText, setMarkdownText] = useState("");
  const [formattedText, setFormattedText] = useState("");
  const [config, setConfig] = useState<FormatterConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format markdown text whenever input or config changes
  useEffect(() => {
    if (!markdownText) {
      setFormattedText("");
      return;
    }

    // Use the formatMarkdownText utility function with our component's config
    const result = formatMarkdownText(markdownText, config);
    setFormattedText(result);
  }, [markdownText, config]);

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Markdown Input
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings2 className="h-5 w-5" />
            </Button>
          </CardTitle>
          <CardDescription>
            Write your content using Markdown syntax
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-[70vh] p-3 border rounded-md font-mono text-sm bg-transparent resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
            placeholder="Type your LinkedIn content here using Markdown formatting...

Examples:
**bold text**
*italic text*
- bullet point
# Heading
`code`"
          />
        </CardContent>
        {showConfig && (
          <CardFooter className="flex flex-col gap-2">
            <div className="w-full">
              <label className="text-sm font-medium">Bullet Replacement:</label>
              <Input
                value={config.bulletReplacement}
                onChange={(e) => setConfig({...config, bulletReplacement: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium">Heading Prefix:</label>
              <Input
                value={config.headingPrefix}
                onChange={(e) => setConfig({...config, headingPrefix: e.target.value})}
                className="mt-1"
              />
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Output Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            LinkedIn Formatted Text
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex gap-2 items-center"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardTitle>
          <CardDescription>
            Ready to paste into LinkedIn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="w-full h-[70vh] p-3 border rounded-md overflow-y-auto whitespace-pre-wrap"
            style={{ fontFamily: 'sans-serif' }}
          >
            {formattedText || <span className="text-gray-400">Formatted text will appear here...</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LinkedInTextFormatter;
