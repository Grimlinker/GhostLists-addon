import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function DroppableZone({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      containerId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      id={id}
      className="space-y-2 bg-white p-4 rounded-xl shadow min-h-[200px]"
    >
      {children}
    </div>
  );
}
