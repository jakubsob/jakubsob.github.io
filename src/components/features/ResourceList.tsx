import { FilteredList } from "@/components/features/FilteredList";
import { Resource, type ResourceItem } from "@/components/features/Resource";

interface ResourceListProps {
  items: ResourceItem[];
}

export function ResourceList({ items }: ResourceListProps) {
  return (
    <FilteredList
      items={items}
      getTags={(item) => [item.group, item.format, item.actionability]}
      keyExtractor={(item) => item.href}
      layout="notebook"
      rowH="240px"
      sidebarTitle="Topics"
      renderItem={(item, selectedTags) => (
        <Resource item={item} selectedTags={selectedTags} />
      )}
    />
  );
}
