import Image from "next/image";
import { redirect } from "next/navigation";

import { getPostLoginRedirectPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";

import logo from "../../../assets/vs-logo-transparent.png";
import { signIn } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "이메일 또는 비밀번호를 확인해 주세요.",
  missing: "이메일과 비밀번호를 모두 입력해 주세요.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getPostLoginRedirectPath(params.next ?? "/");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next);
  }

  const message = params.error ? errorMessages[params.error] : null;

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
      <section className="hidden border-r border-[var(--border)] bg-[var(--surface)] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <Image
            src={logo}
            alt="Visual Square"
            className="h-16 w-16 object-contain"
            priority
          />
          <p className="font-display mt-5 text-3xl">Visual Square</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            프로젝트, 인보이스, 발주·빌, 결과물을 한 곳에서 관리하는 내부
            ERP입니다.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--coral-strong)]">
          Staff access only
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src={logo}
              alt="Visual Square"
              className="h-12 w-12 object-contain"
              priority
            />
            <span className="font-display text-xl">Visual Square ERP</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--coral-strong)]">
            Login
          </p>
          <h1 className="mt-2 text-2xl font-semibold">직원 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Supabase Auth에 등록된 직원 계정으로 로그인하세요.
          </p>

          <form action={signIn} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 h-11 w-full border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--coral)]"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 h-11 w-full border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--coral)]"
              />
            </div>

            {message ? (
              <p className="border border-[#8A1F1F]/25 bg-[#F8E8E8] px-3 py-2 text-sm font-semibold text-[#8A1F1F]">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              className="h-11 w-full border border-[var(--coral)] bg-[var(--coral)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--coral-strong)]"
            >
              로그인
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
