import React from "react";
import { useState } from "react";
import { Toggle } from "./Toggle";
import { Tooltip } from "./Tooltip";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";

interface CatalogCardProps {
  catalog: {
    id: string;
    name: string;
    type: "movie" | "series";
    icon?: string;
    enabled: boolean;
    showInHome: boolean;
  };
  onChange?: (enabled: boolean, showInHome: boolean) => void;
  onRename?: (newName: string) => void;
  index?: number;
  isDragging?: boolean;
  hideToggles?: boolean;
}

export default function CatalogCard({
  catalog,
  onChange,
  onRename,
  index,
  isDragging = false,
  hideToggles = false,
}: CatalogCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(catalog.name);

  const handleToggle = (key: "enabled" | "showInHome") => {
    const updated = {
      enabled: key === "enabled" ? !catalog.enabled : catalog.enabled,
      showInHome: key === "showInHome" ? !catalog.showInHome : catalog.showInHome,
    };

    // Auto-disable showInHome if Enable is turned off
    if (!updated.enabled) {
      updated.showInHome = false;
    }

    onChange?.(updated.enabled, updated.showInHome);
  };

  const handleRenameSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== catalog.name) {
      onRename?.(trimmed);
    }
    setIsRenaming(false);
  };

  const typeEmoji = catalog.type === "movie" ? "🎬" : "📺";
  const fallbackIcon = "/default-icon.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index !== undefined ? index * 0.07 : 0,
      }}
      className="relative w-full p-4 rounded-2xl shadow-md transition-all border bg-white/90 border-pink-100 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={catalog.icon || "/fallbackIcon.png"}
            alt="icon"
            onError={(e) => (e.currentTarget.src = "/fallbackIcon.png")}
            className="w-12 h-12 rounded-xl shadow-md border border-purple-200 object-cover bg-white"
          />

          <div>
            {!isRenaming ? (
              <div className="font-semibold text-pink-700 flex items-center gap-2 min-h-[24px]">
                {typeEmoji} {catalog.name}
                <div className="w-4 h-4 flex items-center justify-center">
                  {onRename ? (
                    <Tooltip content="Rename list">
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="hover:text-purple-500"
                      >
                        <Pencil size={14} />
                      </button>
                    </Tooltip>
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </div>
              </div>
            ) : (

              <div className="flex gap-2 items-center">
                <input
                  className="border px-2 rounded text-sm text-purple-600"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  autoFocus
                />
                <button
                  className="text-sm text-pink-500 hover:underline"
                  onClick={handleRenameSubmit}
                >
                  Save
                </button>
                <button
                  className="text-sm text-gray-500 hover:underline"
                  onClick={() => setIsRenaming(false)}
                >
                  Cancel
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 capitalize">
              {catalog.type} {index !== undefined && `List`}
            </p>
          </div>
        </div>
      </div>

      {!hideToggles && (
        <div className="flex justify-between items-center mt-4">
          <label className="flex items-center gap-2 text-sm">
            <span>Enable</span>
            <Toggle
              checked={catalog.enabled}
              onChange={() => handleToggle("enabled")}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span>Home</span>
            <Toggle
              checked={catalog.showInHome}
              onChange={() => handleToggle("showInHome")}
              disabled={!catalog.enabled}
            />
          </label>
        </div>
      )}


    </motion.div>
  );
}
