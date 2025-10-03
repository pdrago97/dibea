import { supabase } from "@/lib/supabase";

export interface Adoption {
  id: string;
  animal_id: string;
  user_id: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA" | "CONCLUIDA";
  created_at: string;
  updated_at: string;
  notes?: string;
  animal?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    photos: string[];
  };
}

export class AdoptionService {
  static async createAdoption(
    animalId: string,
    userId: string,
    notes?: string,
  ): Promise<Adoption> {
    try {
      const { data, error } = await supabase
        .from("adocoes")
        .insert([
          {
            animal_id: animalId,
            user_id: userId,
            status: "PENDENTE",
            notes: notes || "",
          },
        ])
        .select(
          `
          *,
          animal:animais(id, name, species, breed, photos)
        `,
        )
        .single();

      if (error) {
        console.error("Error creating adoption:", error);
        throw error;
      }

      return data as Adoption;
    } catch (error) {
      console.error("Error in AdoptionService.createAdoption:", error);
      throw error;
    }
  }

  static async getUserAdoptions(userId: string): Promise<Adoption[]> {
    try {
      const { data, error } = await supabase
        .from("adocoes")
        .select(
          `
          *,
          animal:animais(id, name, species, breed, photos)
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user adoptions:", error);
        throw error;
      }

      return (data as Adoption[]) || [];
    } catch (error) {
      console.error("Error in AdoptionService.getUserAdoptions:", error);
      throw error;
    }
  }

  static async getAdoptionById(id: string): Promise<Adoption | null> {
    try {
      const { data, error } = await supabase
        .from("adocoes")
        .select(
          `
          *,
          animal:animais(id, name, species, breed, photos)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching adoption:", error);
        return null;
      }

      return data as Adoption;
    } catch (error) {
      console.error("Error in AdoptionService.getAdoptionById:", error);
      throw error;
    }
  }

  static async updateAdoptionStatus(
    id: string,
    status: Adoption["status"],
    notes?: string,
  ): Promise<Adoption> {
    try {
      const { data, error } = await supabase
        .from("adocoes")
        .update({
          status,
          notes: notes || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          animal:animais(id, name, species, breed, photos)
        `,
        )
        .single();

      if (error) {
        console.error("Error updating adoption status:", error);
        throw error;
      }

      return data as Adoption;
    } catch (error) {
      console.error("Error in AdoptionService.updateAdoptionStatus:", error);
      throw error;
    }
  }

  static async getPendingAdoptionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("adocoes")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDENTE");

      if (error) {
        console.error("Error counting pending adoptions:", error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error(
        "Error in AdoptionService.getPendingAdoptionsCount:",
        error,
      );
      throw error;
    }
  }

  static async checkExistingAdoption(
    animalId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("adocoes")
        .select("id")
        .eq("animal_id", animalId)
        .eq("user_id", userId)
        .in("status", ["PENDENTE", "APROVADA"])
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking existing adoption:", error);
        throw error;
      }

      return !!data; // Returns true if adoption exists
    } catch (error) {
      console.error("Error in AdoptionService.checkExistingAdoption:", error);
      throw error;
    }
  }
}
