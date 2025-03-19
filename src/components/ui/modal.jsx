import React from "react";

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-10">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <button
          className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-300 hover:bg-gray-400 px-4 py-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
