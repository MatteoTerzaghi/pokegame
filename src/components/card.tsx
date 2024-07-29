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
      // className="xl:bg-red-400 lg:bg-green-400 md:bg-pink-400 sm:bg-blue-400 bg-white p-10 border col-start-4 col-span-6 rounded-3xl shadow-lg"
      className="bg-white col-span-full p-5 sm:col-span-10 sm:col-start-2 sm:rounded-3xl sm:shadow-lg sm:border sm:p-10 xl:col-span-8 xl:col-start-3"
      style={{ minHeight: `${minHeight ? `${minHeight}px` : "0px"}` }}
    >
      {children}
    </div>
  );
}
