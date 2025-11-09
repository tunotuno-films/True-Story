// components/Highlight.tsx
import React from "react";

type HighlightProps = {
  children: React.ReactNode;
};

export default function Highlight({ children }: HighlightProps) {
  return (
    <span className="font-bold">
      {children}
    </span>
  );
}
