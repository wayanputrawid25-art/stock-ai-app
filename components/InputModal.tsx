"use client";

import { useState, useEffect } from "react";
import { OcrInputForm } from "@/components/ocr-input-form";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonLabel?: string;
}

export function InputModal({ isOpen, onClose, buttonLabel = "Simpan Data" }: InputModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Input Data</h2>
              <p className="text-xs text-muted-foreground">Upload gambar atau input manual</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-6">
              <OcrInputForm buttonLabel={buttonLabel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useInputModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
    InputModal: (props: Omit<InputModalProps, "isOpen" | "onClose">) => (
      <InputModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        {...props} 
      />
    ),
  };
}
