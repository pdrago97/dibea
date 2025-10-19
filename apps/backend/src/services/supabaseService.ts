import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;
  private config: SupabaseConfig;

  constructor() {
    this.config = {
      url: process.env.SUPABASE_URL!,
      anonKey: process.env.SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    };

    // Client for regular operations (with RLS)
    this.client = createClient(this.config.url, this.config.anonKey);

    // Admin client for bypassing RLS when needed
    this.adminClient = createClient(
      this.config.url,
      this.config.serviceRoleKey,
    );

    console.log("✅ Supabase Service initialized");
  }

  // Get regular client (with RLS)
  getClient(): SupabaseClient {
    return this.client;
  }

  // Get admin client (bypasses RLS)
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  // Animals operations
  async getAnimals(filters?: any) {
    const query = this.client.from("animals").select(`
        *,
        municipality:municipalities(name, state),
        procedures:procedures(*)
      `);

    if (filters?.status) {
      query.eq("status", filters.status);
    }

    if (filters?.species) {
      query.eq("species", filters.species);
    }

    if (filters?.municipality_id) {
      query.eq("municipality_id", filters.municipality_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("❌ Error fetching animals:", error);
      throw error;
    }

    return data;
  }

  async createAnimal(animalData: any) {
    const { data, error } = await this.client
      .from("animals")
      .insert([animalData])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating animal:", error);
      throw error;
    }

    return data;
  }

  async updateAnimal(id: string, updates: any) {
    const { data, error } = await this.client
      .from("animals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating animal:", error);
      throw error;
    }

    return data;
  }

  // Dashboard stats
  async getDashboardStats() {
    try {
      const [
        { count: totalAnimals },
        { count: availableAnimals },
        { count: adoptedAnimals },
        { count: totalMunicipalities },
        { count: totalUsers },
        { count: totalAdoptions },
      ] = await Promise.all([
        this.client.from("animals").select("*", { count: "exact", head: true }),
        this.client
          .from("animals")
          .select("*", { count: "exact", head: true })
          .eq("status", "DISPONIVEL"),
        this.client
          .from("animals")
          .select("*", { count: "exact", head: true })
          .eq("status", "ADOTADO"),
        this.client
          .from("municipalities")
          .select("*", { count: "exact", head: true })
          .eq("active", true),
        this.client.from("users").select("*", { count: "exact", head: true }),
        this.client
          .from("adoptions")
          .select("*", { count: "exact", head: true }),
      ]);

      return {
        totalAnimals: totalAnimals || 0,
        availableAnimals: availableAnimals || 0,
        adoptedAnimals: adoptedAnimals || 0,
        totalMunicipalities: totalMunicipalities || 0,
        totalUsers: totalUsers || 0,
        totalAdoptions: totalAdoptions || 0,
        adoptionRate:
          (totalAnimals || 0) > 0
            ? (((adoptedAnimals || 0) / (totalAnimals || 1)) * 100).toFixed(1)
            : "0",
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // Users operations
  async getUsers(filters?: any) {
    const query = this.adminClient.from("users").select("*");

    if (filters?.role) {
      query.eq("role", filters.role);
    }

    if (filters?.active !== undefined) {
      query.eq("active", filters.active);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }

    return data;
  }

  // Municipalities operations
  async getMunicipalities() {
    const { data, error } = await this.client
      .from("municipalities")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {
      console.error("❌ Error fetching municipalities:", error);
      throw error;
    }

    return data;
  }

  // Adoptions operations
  async getAdoptions(filters?: any) {
    const query = this.client.from("adoptions").select(`
        *,
        animal:animals(*),
        tutor:tutors(*)
      `);

    if (filters?.status) {
      query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("❌ Error fetching adoptions:", error);
      throw error;
    }

    return data;
  }

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from("municipalities")
        .select("count")
        .limit(1);

      if (error) {
        console.error("❌ Supabase connection test failed:", error);
        return false;
      }

      console.log("✅ Supabase connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Supabase connection test error:", error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
