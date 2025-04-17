import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GroupSummaryCard from "./GroupSummaryCard";
import type { Catalog, Group } from "@/contexts/ConfigContext";

interface Props {
  group: Group;
  catalogs: Catalog[];
  activeId: string | null;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;
  handleChange: (enabled: boolean, showInHome: boolean, catalog: Catalog) => void;
  handleRename: (newName: string, catalog: Catalog) => void;
  onRename: (newName: string) => void;
  onToggleEnable: (val: boolean) => void;
  onToggleHome: (val: boolean) => void;
  onRemove: () => void;
  containerId: string;
}

export default function SortableGroupCard({
  group,
  catalogs,
  activeId,
  setGroups,
  setCatalogs,
  handleChange,
  handleRename,
  onRemove,
  onRename,
  onToggleEnable,
  onToggleHome,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging = false,
  } = useSortable({
    id: `group:${group.id}`,
    data: {
      containerId: group.listIds.every((id) =>
        catalogs.find((cat) => `${cat.id}-${cat.type}` === id)?.showInHome
      )
        ? "home"
        : "enabled",
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GroupSummaryCard
        group={group}
        catalogs={catalogs}
        activeId={activeId}
        setGroups={setGroups}
        setCatalogs={setCatalogs}
        handleChange={handleChange}
        handleRename={handleRename}
        onRename={onRename}
        onToggleEnable={onToggleEnable}
        onToggleHome={onToggleHome}
        onRemove={onRemove}
      />
    </div>
  );
}
