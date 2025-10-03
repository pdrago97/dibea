import { supabase } from "@/lib/supabase";

export interface Animal {
  id: string;
  name: string;
  species: "CANINO" | "FELINO" | "OUTRO";
  breed: string;
  age: number;
  gender: "MACHO" | "FEMEA";
  size: "PEQUENO" | "MEDIO" | "GRANDE";
  description: string;
  location: string;
  status: "DISPONIVEL" | "ADOTADO" | "RESERVADO" | "CUIDADOS_MEDICOS";
  photos: string[];
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
  };
  created_at: string;
  updated_at: string;
  municipality_id: string;
}

export interface AnimalFilters {
  query?: string;
  species?: string;
  size?: string;
  gender?: string;
  status?: string;
  municipality_id?: string;
  limit?: number;
}

export class AnimalService {
  static async getAnimals(filters: AnimalFilters = {}): Promise<Animal[]> {
    try {
      let query = supabase
        .from("animais")
        .select(
          `
          *,
          municipio:municipios(nome, estado)
        `,
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,breed.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
        );
      }

      if (filters.species) {
        query = query.eq("species", filters.species);
      }

      if (filters.size) {
        query = query.eq("size", filters.size);
      }

      if (filters.gender) {
        query = query.eq("gender", filters.gender);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.municipality_id) {
        query = query.eq("municipality_id", filters.municipality_id);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching animals:", error);
        throw error;
      }

      return (
        data?.map((animal) => ({
          id: animal.id,
          name: animal.name,
          species: animal.species,
          breed: animal.breed || "SRD",
          age: animal.age,
          gender: animal.gender,
          size: animal.size,
          description: animal.description,
          location: animal.municipio
            ? `${animal.municipio.nome} - ${animal.municipio.estado}`
            : "Local não informado",
          status: animal.status,
          photos: animal.photos || [],
          medicalInfo: {
            vaccinated: animal.vaccinated || false,
            neutered: animal.neutered || false,
            dewormed: animal.dewormed || false,
          },
          created_at: animal.created_at,
          updated_at: animal.updated_at,
          municipality_id: animal.municipality_id,
        })) || []
      );
    } catch (error) {
      console.error("Error in AnimalService.getAnimals:", error);
      throw error;
    }
  }

  static async getAnimalById(id: string): Promise<Animal | null> {
    try {
      const { data, error } = await supabase
        .from("animais")
        .select(
          `
          *,
          municipio:municipios(nome, estado)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching animal:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        species: data.species,
        breed: data.breed || "SRD",
        age: data.age,
        gender: data.gender,
        size: data.size,
        description: data.description,
        location: data.municipio
          ? `${data.municipio.nome} - ${data.municipio.estado}`
          : "Local não informado",
        status: data.status,
        photos: data.photos || [],
        medicalInfo: {
          vaccinated: data.vaccinated || false,
          neutered: data.neutered || false,
          dewormed: data.dewormed || false,
        },
        created_at: data.created_at,
        updated_at: data.updated_at,
        municipality_id: data.municipality_id,
      };
    } catch (error) {
      console.error("Error in AnimalService.getAnimalById:", error);
      throw error;
    }
  }

  static async createAnimal(
    animalData: Omit<Animal, "id" | "created_at" | "updated_at">,
  ): Promise<Animal> {
    try {
      const { data, error } = await supabase
        .from("animais")
        .insert([
          {
            name: animalData.name,
            species: animalData.species,
            breed: animalData.breed,
            age: animalData.age,
            gender: animalData.gender,
            size: animalData.size,
            description: animalData.description,
            status: animalData.status,
            photos: animalData.photos,
            vaccinated: animalData.medicalInfo.vaccinated,
            neutered: animalData.medicalInfo.neutered,
            dewormed: animalData.medicalInfo.dewormed,
            municipality_id: animalData.municipality_id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating animal:", error);
        throw error;
      }

      return data as Animal;
    } catch (error) {
      console.error("Error in AnimalService.createAnimal:", error);
      throw error;
    }
  }

  static async updateAnimal(
    id: string,
    updates: Partial<Animal>,
  ): Promise<Animal> {
    try {
      const { data, error } = await supabase
        .from("animais")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating animal:", error);
        throw error;
      }

      return data as Animal;
    } catch (error) {
      console.error("Error in AnimalService.updateAnimal:", error);
      throw error;
    }
  }

  static async addAnimalPhoto(
    animalId: string,
    photoUrl: string,
  ): Promise<void> {
    try {
      // Get current animal
      const animal = await this.getAnimalById(animalId);
      if (!animal) throw new Error("Animal not found");

      // Update photos array
      const updatedPhotos = [...animal.photos, photoUrl];

      await this.updateAnimal(animalId, { photos: updatedPhotos });
    } catch (error) {
      console.error("Error in AnimalService.addAnimalPhoto:", error);
      throw error;
    }
  }

  static async getAvailableAnimalsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("animais")
        .select("*", { count: "exact", head: true })
        .eq("status", "DISPONIVEL");

      if (error) {
        console.error("Error counting available animals:", error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in AnimalService.getAvailableAnimalsCount:", error);
      throw error;
    }
  }
}
