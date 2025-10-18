import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      const [
        { count: totalAnimals },
        { count: availableAnimals },
        { count: adoptedAnimals },
        { count: totalMunicipalities },
        { count: totalUsers }
      ] = await Promise.all([
        supabase.from('animais').select('*', { count: 'exact', head: true }),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'DISPONIVEL'),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'ADOTADO'),
        supabase.from('municipios').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalAnimals: totalAnimals || 0,
        adoptedAnimals: adoptedAnimals || 0,
        activeMunicipalities: totalMunicipalities || 0,
        registeredUsers: totalUsers || 0,
        proceduresCompleted: 0, // Will implement later
        documentsProcessed: 0   // Will implement later
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get featured animals for landing page
  async getFeaturedAnimals() {
    try {
      const { data: animals, error } = await supabase
        .from('animais')
        .select(`
          *,
          municipality:municipios(nome)
        `)
        .eq('status', 'DISPONIVEL')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('❌ Error fetching featured animals:', error);
        throw error;
      }

      return animals?.map((animal: any) => ({
        id: animal.id,
        name: animal.nome,
        species: animal.especie === 'CANINO' ? 'Cão' : animal.especie === 'FELINO' ? 'Gato' : animal.especie,
        age: animal.data_nascimento ? `${new Date().getFullYear() - new Date(animal.data_nascimento).getFullYear()} anos` : 'Idade não informada',
        description: animal.observacoes || 'Animal carinhoso e brincalhão',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
        municipality: animal.municipality?.nome || 'N/A',
        urgent: false
      })) || [];
    } catch (error) {
      console.error('❌ Error fetching featured animals:', error);
      throw error;
    }
  },

  // Get animals with filters
  async getAnimals(filters?: { status?: string; species?: string; municipality_id?: string }) {
    try {
      let query = supabase
        .from('animais')
        .select(`
          *,
          municipality:municipios(nome)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.species && filters.species !== 'all') {
        query = query.eq('especie', filters.species);
      }

      if (filters?.municipality_id) {
        query = query.eq('municipality_id', filters.municipality_id);
      }

      const { data: animals, error } = await query;

      if (error) {
        console.error('❌ Error fetching animals:', error);
        throw error;
      }

      return animals?.map((animal: any) => ({
        id: animal.id,
        name: animal.nome,
        species: animal.especie,
        breed: animal.raca || 'SRD',
        sex: animal.sexo,
        age: animal.data_nascimento ? new Date().getFullYear() - new Date(animal.data_nascimento).getFullYear() : null,
        size: animal.porte,
        description: animal.observacoes,
        status: animal.status,
        municipality: animal.municipality?.nome || 'N/A',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
        createdAt: animal.created_at
      })) || [];
    } catch (error) {
      console.error('❌ Error fetching animals:', error);
      throw error;
    }
  },

  // Get municipalities
  async getMunicipalities() {
    try {
      const { data: municipalities, error } = await supabase
        .from('municipios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Error fetching municipalities:', error);
        throw error;
      }

      return municipalities || [];
    } catch (error) {
      console.error('❌ Error fetching municipalities:', error);
      throw error;
    }
  }
};

export default supabase;
