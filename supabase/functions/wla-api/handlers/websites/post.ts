import { getDefaultEnv } from "../../config.ts";

export const postWebsites = async (c) => {
  // check empty body
  const bodyText = await c.req.text();
  if (!bodyText) {
    console.log("empty body", bodyText);
    return c.json({ error: "empty body" }, 400);
  }

  // validate payload
  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch (_error) {
    console.log("invalid json payload");
    return c.json({ error: "invalid payload" }, 400);
  }

  const { websites, commit, timestamp, columns } = payload;
  if (
    !websites ||
    !Array.isArray(websites) ||
    !websites.length ||
    !commit ||
    !timestamp ||
    !columns
  ) {
    console.log("invalid payload", payload);
    return c.json({ error: "invalid payload" }, 400);
  }

  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  try {
    // Store websites to websites table
    // Supabase equivalent for REPLACE INTO is `upsert`
    const websitesToUpsert = websites.map((website) => ({
      env,
      website: website["website"].toLowerCase(), // Ensure lowercase as in original
      data: website, // Supabase can directly store JSON objects in a `jsonb` column
    }));

    const { error: websitesError, data: websitesData } = await supabase
      .from("websites")
      .upsert(websitesToUpsert, {
        onConflict: "env, website", // Specify the unique constraint for upsert
        ignoreDuplicates: false, // Ensure it updates if conflicts
      }).select();

    if (websitesError) {
      throw new Error(`Failed to save websites: ${websitesError.message}`);
    }

    // Store commit and timestamp into info table
    const { error: infoError } = await supabase
      .from("info")
      .upsert(
        {
          env,
          commit,
          timestamp,
        },
        { onConflict: "env" }, // Assuming 'env' is the unique key for the info table
      );

    if (infoError) {
      throw new Error(`Failed to save info: ${infoError.message}`);
    }

    // Store columns into columns table
    const { error: columnsError } = await supabase
      .from("columns")
      .upsert(
        {
          env,
          columns, // Supabase can directly store JSON objects in a `jsonb` column
        },
        { onConflict: "env" }, // Assuming 'env' is the unique key for the columns table
      );

    if (columnsError) {
      throw new Error(`Failed to save columns: ${columnsError.message}`);
    }

    console.log("websites", websites?.length, commit);
    return c.json({ count: websitesData?.length ?? 0 });
  } catch (e) {
    console.log("failed to save websites", e.message);
    return c.json({ error: e.message }, 500);
  }
};
