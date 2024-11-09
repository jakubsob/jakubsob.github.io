export function getTagsWithCounts(posts) {
  const tagCounts = {};

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });

  return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
}
