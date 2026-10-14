import { supabase } from "./client.js";
import { createSupabaseService } from "./service.js";

export default supabase ? createSupabaseService(supabase) : null;
