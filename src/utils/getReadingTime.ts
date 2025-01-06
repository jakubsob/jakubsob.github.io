export const getReadingTime = (text: string): string => {
  // Remove markdown syntax
  const cleanText = text.replace(/[#*`_\[\]()]/g, "");
  // Split into words and filter out empty strings
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
  // Calculate minutes based on 200 words per minute
  const minutes = Math.ceil(words.length / 200);
  return `${minutes} min read`;
};
