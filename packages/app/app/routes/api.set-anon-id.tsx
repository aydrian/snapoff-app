import { parseWithZod } from "@conform-to/zod";
import type { Route } from "./+types/api.set-anon-id";
import { z } from "zod";
import { authData } from "~/cookies.server";
import { data } from "react-router";

const schema = z.object({
  anonId: z.string()
});

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await authData.parse(cookieHeader)) || {};

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { anonId } = submission.value;

  cookie.anonId = anonId;

  return data(null, {
    headers: {
      "Set-Cookie": await authData.serialize(cookie)
    }
  });
}
