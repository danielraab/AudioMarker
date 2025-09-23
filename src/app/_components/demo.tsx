import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { LatestPost } from "./post";

// TODO remove this component
export default async function Demo() {
  const session = await auth();
  const hello = await api.post.hello({ text: "from tRPC" });

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }
    return (<>
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl">
          {hello ? hello.greeting : "Loading tRPC query..."}
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full px-10 py-3 font-semibold no-underline transition"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>

        {session?.user && <LatestPost />}
      </div>
    </>)
}