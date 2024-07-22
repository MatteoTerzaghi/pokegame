import { ReactNode } from "react";

export default function Card({
  children,
  minHeight,
}: {
  children?: ReactNode;
  minHeight?: number;
}) {
  return (
    <div
      className="bg-white p-10 border col-start-4 col-span-6 rounded-3xl shadow-lg"
      style={{ minHeight: `${minHeight ? `${minHeight}px` : "0px"}` }}
    >
      {children}
    </div>
  );
}
