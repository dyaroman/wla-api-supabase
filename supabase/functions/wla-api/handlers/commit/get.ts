import { getDefaultEnv } from "../../config.ts";

export const getCommit = async (c) => {
  const env = getDefaultEnv();
  const supabase = c.get("supabase"); // Get the Supabase client instance

  try {
    const { data, error } = await supabase
      .from("info")
      .select("commit") // Select only the 'commit' column
      .eq("env", env) // Filter by environment
      .single(); // Expect a single row

    if (error) {
      // Supabase returns an error if no row is found with .single()
      // or if there's a database error.
      if (error.code === "PGRST116") { // Specific Supabase error for 'no rows found'
        console.log(`No commit found for env: ${env}`);
        return c.json({ commit: null }); // Return null commit if not found
      }
      throw new Error(`Failed to fetch commit: ${error.message}`);
    }

    console.log("commit", data);
    return c.json(data); // `data` will be an object like { commit: "abc123def" }
  } catch (e) {
    console.log("failed to fetch info data", e.message);
    return c.json(
      {
        error: "failed to fetch info data",
        message: e.message,
      },
      500,
    );
  }
};
