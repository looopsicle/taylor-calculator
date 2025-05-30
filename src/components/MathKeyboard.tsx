import React from "react";

type Props = {
  onInsert: (v: string) => void;
  onClear: () => void;
  onDelete: () => void;
};

const keys = [
  ["7","8","9","("," )","/"],
  ["4","5","6","^","%","*"],
  ["1","2","3","x","π","-"],
  ["0",".","sin(","cos(","exp(","+"]
];

export default function MathKeyboard({ onInsert, onClear, onDelete }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {/* Tombol angka dan operator */}
      {keys.flat().map((k) => (
        <button
          key={k}
          onClick={() => onInsert(k.replace(" ",""))}
          className="py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          {k}
        </button>
      ))}
    </div>
  );
}
