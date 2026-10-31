interface LoginCardProps {
  children: React.ReactNode;
}

export function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border">
      {children}
    </div>
  );
}
