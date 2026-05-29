import { Post } from "@/components/features/Post";
import { FilteredList } from "@/components/features/FilteredList";
import { Animate } from "@/components/ui/animate";

function PostList({ posts, showControls = true, variant = "card" }) {
  if (!showControls) {
    return (
      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <Animate key={post.slug}>
            <Post post={post} variant={variant} />
          </Animate>
        ))}
      </div>
    );
  }

  return (
    <FilteredList
      items={posts}
      getTags={(post) => post.data.tags}
      keyExtractor={(post) => post.slug}
      layout="notebook"
      rowH="240px"
      sidebarTitle="Topics"
      renderItem={(post, selectedTags) => (
        <Animate key={post.slug}>
          <Post post={post} selectedTags={selectedTags} variant={variant} />
        </Animate>
      )}
    />
  );
}

export default PostList;
