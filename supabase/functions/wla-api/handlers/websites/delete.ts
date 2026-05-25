import { getDefaultEnv } from "../../config.ts";

export const deleteWebsites = async (c) => {
  // check empty body
  const bodyText = await c.req.text();
  if (!bodyText) {
    console.log("empty body", bodyText);
    return c.json({ error: "empty body" }, 400);
  }

  // validate payload
  let websitesToDelete;
  try {
    websitesToDelete = JSON.parse(bodyText);
  } catch (_error) {
    console.log("invalid json payload");
    return c.json({ error: "invalid payload" }, 400);
  }

  if (
    !websitesToDelete || !Array.isArray(websitesToDelete) ||
    !websitesToDelete.length
  ) {
    console.log("invalid payload", websitesToDelete);
    return c.json({ error: "invalid payload" }, 400);
  }

  const env = getDefaultEnv();
  const supabase = c.get("supabase"); // Get the Supabase client instance

  try {
    // Delete websites from the websites table
    // Supabase equivalent for DELETE with multiple conditions
    const { error, data } = await supabase
      .from("websites")
      .delete()
      .eq("env", env)
      .in("website", websitesToDelete.map((website) => website.toLowerCase())) // Filter by websites array, ensure lowercase
      .select(); // Request the count of deleted rows

    if (error) {
      throw new Error(`Failed to delete websites: ${error.message}`);
    }

    // The `count` property from the Supabase response directly gives the number of affected rows
    console.log("Deleted websites:", websitesToDelete, "Count:", data?.length);
    return c.json({ count: data?.length ?? 0 });
  } catch (e) {
    console.log("failed to delete websites", e.message);
    return c.json({ error: e.message }, 500);
  }
};
