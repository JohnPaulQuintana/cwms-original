interface Props {
  title?: string;
  children: React.ReactNode;
  variant?: "centered" | "full"; // 👈 add this
}

export default function AuthLayout({ children, variant = "centered" }: Props) {
  if (variant === "full") {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  // default (old layout)
  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-2">
        {children}
      </div>
    </div>
  );
}