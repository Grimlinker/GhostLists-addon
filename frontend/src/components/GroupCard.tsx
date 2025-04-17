import React from "react";
import { useState } from "react";
import { Toggle } from "./Toggle";
import { Tooltip } from "./Tooltip";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatePresence, motion as m } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

interface GroupCardProps {
  group: {
    name: string;
    subtitle?: string;
    type: "movie" | "series";
    icon?: string;
    enabled: boolean;
    showInHome: boolean;
  };

  onRename?: (newName: string) => void;
  onToggleEnable?: (enabled: boolean) => void;
  onToggleHome?: (showInHome: boolean) => void;
  onChange?: (enabled: boolean, showInHome: boolean) => void;
  onRemove: () => void;
  index?: number;
  children: React.ReactNode;
}

export function GroupCard({
  group,
  onChange,
  onRename,
  onRemove,
  onToggleEnable,
  onToggleHome,
  index,
  children,
}: GroupCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(group.name);
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (key: "enabled" | "showInHome") => {
    const updated = {
      enabled: key === "enabled" ? !group.enabled : group.enabled,
      showInHome: key === "showInHome" ? !group.showInHome : group.showInHome,
    };

    if (!updated.enabled) updated.showInHome = false;

    onToggleEnable?.(updated.enabled);
    onToggleHome?.(updated.showInHome);
    onChange?.(updated.enabled, updated.showInHome);
  };

  const handleRenameSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== group.name) {
      onRename?.(trimmed);
    }
    setIsRenaming(false);
  };

  const typeEmoji = group.type === "movie" ? "🎬" : "📺";

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
      className="relative w-full bg-white/90 p-4 rounded-2xl shadow-md border border-pink-100 hover:shadow-xl transition-all"
    >
      {/* ✖ Top-right close button */}
      <button
        onClick={onRemove}
        className="absolute top-0.5 right-3 text-gray-400 hover:text-pink-700 text-m font-bold"
        aria-label="Remove Group"
      >
        ×
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={group.icon || "/favicon.png"}
            alt="icon"
            onError={(e) => {
              e.currentTarget.onerror = null; // prevent infinite loop
              e.currentTarget.src = "/favicon.png";
            }}
            className="w-12 h-12 rounded-xl shadow-md border border-purple-200 object-cover bg-white"
          />

          <div>
            {!isRenaming ? (
              <div className="font-semibold text-pink-700 flex items-center gap-2">
                {typeEmoji} {group.name}
                {onRename && (
                  <>
                    <Tooltip content="Rename group">
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="hover:text-purple-500"
                      >
                        <Pencil size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip content={expanded ? "Collapse group" : "Expand group"}>
                      <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="text-purple-500 hover:text-purple-700"
                        title="Toggle group list"
                      >
                        {expanded ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </button>
                    </Tooltip>
                  </>
                )}
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
              {group.type} List Group
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4">
        <label className="flex items-center gap-2 text-sm">
          <span>Enable</span>
          <Toggle
            checked={group.enabled}
            onChange={() => handleToggle("enabled")}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>Home</span>
          <Toggle
            checked={group.showInHome}
            onChange={() => handleToggle("showInHome")}
            disabled={!group.enabled}
          />
        </label>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            key="expanded-content"
            initial={{ opacity: 1, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 1, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pt-4"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}