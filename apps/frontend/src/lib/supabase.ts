import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xptonqqagxcpzlgndilj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY';

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
        supabase.from('animals').select('*', { count: 'exact', head: true }),
        supabase.from('animals').select('*', { count: 'exact', head: true }).eq('status', 'DISPONIVEL'),
        supabase.from('animals').select('*', { count: 'exact', head: true }).eq('status', 'ADOTADO'),
        supabase.from('municipalities').select('*', { count: 'exact', head: true }).eq('active', true),
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
        .from('animals')
        .select(`
          *,
          municipality:municipalities(name, state)
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
        name: animal.name,
        species: animal.species === 'CANINO' ? 'Cão' : animal.species === 'FELINO' ? 'Gato' : animal.species,
        age: animal.age ? `${animal.age} anos` : 'Idade não informada',
        description: animal.description || 'Animal carinhoso e brincalhão',
        image: animal.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
        municipality: animal.municipality?.name || 'N/A',
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
        .from('animals')
        .select(`
          *,
          municipality:municipalities(name, state)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.species && filters.species !== 'all') {
        query = query.eq('species', filters.species);
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
        name: animal.name,
        species: animal.species,
        breed: animal.breed || 'SRD',
        sex: animal.sex,
        age: animal.age,
        size: animal.size,
        description: animal.description,
        status: animal.status,
        municipality: animal.municipality?.name || 'N/A',
        image: animal.image_url,
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
        .from('municipalities')
        .select('*')
        .eq('active', true)
        .order('name');

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
