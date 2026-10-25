import { LoginPanel } from "@/components/admin/login-form";

export const metadata = { title: "Logg inn" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin/items";

  return <LoginPanel next={next} />;
}
