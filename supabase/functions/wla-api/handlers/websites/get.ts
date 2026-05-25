import { getDefaultEnv } from "../../config.ts";

export const getWebsites = async (c) => {
  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  const { data: websites, error } = await supabase
    .from("websites")
    .select("website")
    .eq("env", env);

  if (error) {
    console.error("failed to fetch websites list:", error.message);
    return c.json(
      {
        error: "failed to fetch websites list",
        message: error.message,
      },
      500,
    );
  }

  // Handle case where no websites are found for the given env
  if (!websites || websites.length === 0) {
    console.log(`No websites found for environment: ${env}`);
    return c.json([]);
  }

  console.log("websites", websites.length);
  return c.json(websites.map((row) => row["website"]));
};
