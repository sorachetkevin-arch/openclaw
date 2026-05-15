import { auth } from "@/lib/auth";
import Image from "next/image";

interface HeaderProps {
  title: string;
  description?: string;
}

export async function Header({ title, description }: HeaderProps) {
  const session = await auth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>

      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
        </div>
      )}
    </header>
  );
}
