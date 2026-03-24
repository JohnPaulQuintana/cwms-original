import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen md:items-center md:justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-2">
        {/* <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          {title}
        </h1> */}
        {children}
      </div>
    </div>
  );
}
