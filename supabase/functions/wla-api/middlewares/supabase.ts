import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import { MiddlewareHandler } from 'jsr:@hono/hono';

// Define a type for your Supabase client
// This helps with type safety when retrieving it from the context
export type Bindings = {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
};

// Extend Hono's Context to include the Supabase client
// This is crucial for TypeScript to know about `c.get('supabase')`
declare module 'jsr:@hono/hono' {
    interface ContextRenderer {
        // You can define specific types for what you're setting in `c.set`
        // This is optional but good for type safety
        supabase: ReturnType<typeof createClient>;
    }
}

export const supabaseMiddleware: MiddlewareHandler = async (c, next) => {
    // Get Supabase credentials from environment variables
    // IMPORTANT: For Supabase Edge Functions, use Deno.env.get()
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
        // Consider throwing an error or handling this more gracefully
        // depending on your application's requirements
        console.error('Supabase URL or Anon Key is not set in environment variables.');
        return c.json({ error: 'Supabase configuration missing' }, 500);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Attach the supabase client to the context using c.set
    // The key 'supabase' is what you'll use to retrieve it later with c.get('supabase')
    c.set('supabase', supabase);

    await next(); // Continue to the next middleware or route handler
};
