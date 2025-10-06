import { supabase } from '@/lib/supabase';

export interface ElevationRequest {
  id: string;
  user_id: string;
  from_role: string;
  to_role: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO' | 'CANCELLED';
  residence_type?: string;
  has_yard: boolean;
  yard_size?: string;
  household_members: number;
  has_children: boolean;
  children_ages: number[];
  has_other_pets: boolean;
  other_pets_description?: string;
  monthly_income?: number;
  work_schedule?: string;
  reason_for_adoption?: string;
  documents: Record<string, any>;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  document_ratings: Record<string, any>;
  rejection_reason?: string;
  rejection_category?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    id: string;
    email: string;
    phone: string;
  };
  reviewer?: {
    id: string;
    email: string;
  };
}

export interface AdoptionApplication {
  id: string;
  animal_id: string;
  applicant_id: string;
  status: string;
  reason_for_adoption: string;
  previous_pet_experience?: string;
  daily_routine?: string;
  time_available?: string;
  vacation_plan?: string;
  emergency_plan?: string;
  veterinary_budget?: number;
  home_visit_required: boolean;
  home_visit_scheduled_at?: string;
  home_visit_completed_at?: string;
  home_visit_approved?: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  approval_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Relations
  animal?: {
    id: string;
    nome: string;
    especie: string;
    raca?: string;
  };
  applicant?: {
    id: string;
    email: string;
  };
}

/**
 * Fetch all pending elevation requests (for admin)
 */
export async function getPendingElevations(): Promise<ElevationRequest[]> {
  const { data, error } = await supabase
    .from('user_elevation_requests')
    .select(`
      *,
      user:usuarios!user_id (id, email, phone),
      reviewer:usuarios!reviewed_by (id, email)
    `)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending elevations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all elevation requests with filters
 */
export async function getElevations(filters?: {
  status?: string;
  limit?: number;
}): Promise<ElevationRequest[]> {
  let query = supabase
    .from('user_elevation_requests')
    .select(`
      *,
      user:usuarios!user_id (id, email, phone),
      reviewer:usuarios!reviewed_by (id, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching elevations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get elevation request by ID
 */
export async function getElevationById(id: string): Promise<ElevationRequest | null> {
  const { data, error } = await supabase
    .from('user_elevation_requests')
    .select(`
      *,
      user:usuarios!user_id (id, email, phone),
      reviewer:usuarios!reviewed_by (id, email)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching elevation:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new elevation request
 */
export async function createElevationRequest(data: {
  user_id: string;
  from_role: string;
  to_role: string;
  residence_type?: string;
  has_yard?: boolean;
  yard_size?: string;
  household_members?: number;
  has_children?: boolean;
  children_ages?: number[];
  has_other_pets?: boolean;
  other_pets_description?: string;
  monthly_income?: number;
  work_schedule?: string;
  reason_for_adoption?: string;
  documents?: Record<string, any>;
}): Promise<ElevationRequest> {
  const { data: result, error } = await supabase
    .from('user_elevation_requests')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating elevation request:', error);
    throw error;
  }

  return result;
}

/**
 * Approve elevation request (Admin only)
 */
export async function approveElevation(
  elevationId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('user_elevation_requests')
    .update({
      status: 'APPROVED',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes
    })
    .eq('id', elevationId);

  if (error) {
    console.error('Error approving elevation:', error);
    throw error;
  }
}

/**
 * Reject elevation request (Admin only)
 */
export async function rejectElevation(
  elevationId: string,
  adminId: string,
  reason: string,
  category?: string
): Promise<void> {
  const { error } = await supabase
    .from('user_elevation_requests')
    .update({
      status: 'REJECTED',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
      rejection_category: category
    })
    .eq('id', elevationId);

  if (error) {
    console.error('Error rejecting elevation:', error);
    throw error;
  }
}

/**
 * Request more information (Admin only)
 */
export async function requestMoreInfo(
  elevationId: string,
  adminId: string,
  notes: string
): Promise<void> {
  const { error } = await supabase
    .from('user_elevation_requests')
    .update({
      status: 'NEEDS_MORE_INFO',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes
    })
    .eq('id', elevationId);

  if (error) {
    console.error('Error requesting more info:', error);
    throw error;
  }
}

/**
 * Update document ratings (Admin only)
 */
export async function updateDocumentRatings(
  elevationId: string,
  ratings: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('user_elevation_requests')
    .update({
      document_ratings: ratings
    })
    .eq('id', elevationId);

  if (error) {
    console.error('Error updating document ratings:', error);
    throw error;
  }
}

/**
 * Get user's own elevation requests
 */
export async function getMyElevations(userId: string): Promise<ElevationRequest[]> {
  const { data, error } = await supabase
    .from('user_elevation_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my elevations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch pending adoption applications (for admin)
 */
export async function getPendingAdoptions(): Promise<AdoptionApplication[]> {
  const { data, error } = await supabase
    .from('adoption_applications')
    .select(`
      *,
      animal:animais!animal_id (id, nome, especie, raca),
      applicant:usuarios!applicant_id (id, email)
    `)
    .eq('status', 'SOLICITADA')
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching pending adoptions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get adoption stats
 */
export async function getAdoptionStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
}> {
  const [
    { count: pending },
    { count: approved },
    { count: rejected }
  ] = await Promise.all([
    supabase.from('adoption_applications').select('*', { count: 'exact', head: true }).eq('status', 'SOLICITADA'),
    supabase.from('adoption_applications').select('*', { count: 'exact', head: true }).eq('status', 'APROVADA'),
    supabase.from('adoption_applications').select('*', { count: 'exact', head: true }).eq('status', 'REJEITADA')
  ]);

  return {
    pending: pending || 0,
    approved: approved || 0,
    rejected: rejected || 0
  };
}

/**
 * Get elevation stats
 */
export async function getElevationStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
}> {
  const [
    { count: pending },
    { count: approved },
    { count: rejected }
  ] = await Promise.all([
    supabase.from('user_elevation_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('user_elevation_requests').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    supabase.from('user_elevation_requests').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED')
  ]);

  return {
    pending: pending || 0,
    approved: approved || 0,
    rejected: rejected || 0
  };
}

/**
 * Subscribe to real-time elevation requests
 */
export function subscribeToElevations(
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel('elevation-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_elevation_requests'
    }, callback)
    .subscribe();

  return subscription;
}

/**
 * Subscribe to real-time adoption applications
 */
export function subscribeToAdoptions(
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel('adoption-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'adoption_applications'
    }, callback)
    .subscribe();

  return subscription;
}
