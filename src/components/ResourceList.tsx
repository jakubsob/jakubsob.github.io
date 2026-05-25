import { FilteredList } from "@/components/FilteredList";
import { Resource, type ResourceItem } from "@/components/Resource";

interface ResourceListProps {
  items: ResourceItem[];
}

export function ResourceList({ items }: ResourceListProps) {
  return (
    <FilteredList
      items={items}
      getTags={(item) => [item.group, item.format, item.actionability]}
      keyExtractor={(item) => item.href}
      renderItem={(item, selectedTags) => (
        <Resource item={item} selectedTags={selectedTags} />
      )}
    />
  );
}
