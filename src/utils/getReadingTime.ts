import calculateReadingTime from 'reading-time';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

export const getReadingTime = (text: string): string => {
  const { minutes } = calculateReadingTime(toString(fromMarkdown(text)));
  return `${Math.ceil(minutes)} min read`;
};
