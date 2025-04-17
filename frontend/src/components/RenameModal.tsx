import React, { useState } from "react";

interface RenameModalProps {
  initialName: string;
  onRename: (newName: string) => void;
  onClose?: () => void;
}

export default function RenameModal({ initialName, onRename, onClose }: RenameModalProps) {
  const [newName, setNewName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRename(newName.trim() || initialName);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-purple-700">Rename List</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-red-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
