import type { Route } from "./+types/images.$imageKey";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { imageKey } = params;
  const { snapoff_assets } = context.cloudflare.env;

  if (!imageKey) {
    return new Response("Image key is required", { status: 400 });
  }

  try {
    const object = await snapoff_assets.get(imageKey);

    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
