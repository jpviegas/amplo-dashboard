import { PasswordForm } from "./passwordForm";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const tokenParam = params.token;
  const token = Array.isArray(tokenParam)
    ? (tokenParam[0] ?? "")
    : (tokenParam ?? "");

  return (
    <main className="flex min-h-dvh w-full items-center justify-center">
      <div className="w-full max-w-sm md:max-w-md">
        <PasswordForm token={token} />
      </div>
    </main>
  );
}
