// src/components/MathKeyboard.tsx
import React from "react";

type Props = {
  onInsert: (v: string) => void;
  onClear: () => void;
  onDelete: () => void;
};

const keys = [
  ["7","8","9","(",")","/"],
  ["4","5","6","^","%","*"],
  ["1","2","3","x","π","-"],
  ["0",".","sin(","cos(","exp(","+"]
];

export default function MathKeyboard({ onInsert, onClear, onDelete }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {keys.flat().map((k) => (
        <button
          key={k}
          onClick={() => onInsert(k.replace(" ", ""))}
          className={`
            py-2 
            rounded-lg
            font-medium 
            border 
            transition
            
            /* Light mode: latar terang, teks gelap, border abu-300 */
            bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200

            /* Dark mode: latar gelap, teks terang, border abu-700 */
            dark:bg-gray-100 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700
          `}
        >
          {k.trim()}
        </button>
      ))}

      {/* Tombol Clear (CLR) */}
      <button
        onClick={onClear}
        className={`
          col-span-3
          py-2 
          rounded-lg
          font-semibold 
          border 
          transition

          /* Light mode */
          bg-red-100 text-red-700 border-red-300 hover:bg-red-200

          /* Dark mode */
          dark:bg-red-800 dark:text-red-200 dark:border-red-600 dark:hover:bg-red-700
        `}
      >
        CLR
      </button>

      {/* Tombol Delete (DEL) */}
      <button
        onClick={onDelete}
        className={`
          col-span-3
          py-2 
          rounded-lg
          font-semibold 
          border
          transition

          /* Light mode */
          bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200

          /* Dark mode */
          dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600 dark:hover:bg-yellow-700
        `}
      >
        DEL
      </button>
    </div>
  );
}
