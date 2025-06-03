export const getCombined = async (c) => {
  const { env } = c.req.query();
  const supabase = c.get("supabase"); // Get the Supabase client instance

  try {
    // Use Promise.all to fetch data from all three tables concurrently
    const [infoResult, columnsResult, websitesResult] = await Promise.all([
      // Get data from info table
      supabase
        .from("info")
        .select("commit, timestamp") // Select specific columns
        .eq("env", env)
        .single(), // Expect a single row for info

      // Get data from columns table
      supabase
        .from("columns")
        .select("columns") // Select the 'columns' column (assuming it's jsonb)
        .eq("env", env)
        .single(), // Expect a single row for columns

      // Get data from websites table
      supabase
        .from("websites")
        .select("data") // Select the 'data' column (assuming it's jsonb)
        .eq("env", env),
    ]);

    // --- Process infoData ---
    if (infoResult.error && infoResult.error.code !== "PGRST116") { // PGRST116 is "no rows found"
      throw new Error(`Failed to fetch info data: ${infoResult.error.message}`);
    }
    const { commit, timestamp } = infoResult.data ?? {};

    // --- Process columnsData ---
    if (columnsResult.error && columnsResult.error.code !== "PGRST116") {
      throw new Error(
        `Failed to fetch columns data: ${columnsResult.error.message}`,
      );
    }
    // Supabase returns JSONB columns as parsed JavaScript objects
    const columns = columnsResult.data?.columns ?? {}; // Access directly, no need for JSON.parse

    // --- Process websitesData ---
    if (websitesResult.error) {
      throw new Error(
        `Failed to fetch websites data: ${websitesResult.error.message}`,
      );
    }
    // Supabase returns JSONB columns as parsed JavaScript objects directly
    const websites = websitesResult.data?.map((row) => row.data) ?? []; // Map to get the 'data' object

    console.log("websites", websites?.length, "commit", commit);

    return c.json({
      commit,
      timestamp,
      columns,
      websites,
    });
  } catch (e) {
    console.log("failed to fetch full data", e.message);
    return c.json(
      {
        error: "failed to fetch full data",
        message: e.message,
      },
      500,
    );
  }
};
