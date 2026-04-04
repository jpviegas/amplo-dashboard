import { PasswordForm } from "../../cadastrar-senha/passwordForm";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="flex min-h-dvh w-full items-center justify-center">
      <div className="w-full max-w-sm md:max-w-md">
        <PasswordForm token={token} />
      </div>
    </main>
  );
}

