// Shared types between frontend and backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Animal related types
export interface AnimalFilters extends FilterParams {
  species?: string;
  sex?: string;
  size?: string;
  status?: string;
  ageMin?: number;
  ageMax?: number;
  hasPhotos?: boolean;
}

export interface AnimalCreateData {
  name: string;
  species: string;
  breed?: string;
  sex: string;
  size: string;
  birthDate?: string;
  weight?: number;
  color?: string;
  temperament?: string;
  observations?: string;
}

// Tutor related types
export interface TutorFilters extends FilterParams {
  status?: string;
  city?: string;
  state?: string;
  hasExperience?: boolean;
}

export interface TutorCreateData {
  cpf: string;
  rg?: string;
  name: string;
  email?: string;
  phone: string;
  fullAddress: string;
  zipCode: string;
  city: string;
  state: string;
  housingType: string;
  hasExperience: boolean;
  observations?: string;
}

// Adoption related types
export interface AdoptionFilters extends FilterParams {
  status?: string;
  animalId?: string;
  tutorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdoptionCreateData {
  animalId: string;
  tutorId: string;
  observations?: string;
}

// Complaint related types
export interface ComplaintFilters extends FilterParams {
  type?: string;
  status?: string;
  priority?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export interface ComplaintCreateData {
  type: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tutorId?: string;
}

// Dashboard types
export interface DashboardStats {
  totalAnimals: number;
  availableAnimals: number;
  adoptedAnimals: number;
  totalTutors: number;
  activeTutors: number;
  pendingAdoptions: number;
  openComplaints: number;
  activeCampaigns: number;
}

export interface DashboardKPIs {
  adoptionsThisMonth: number;
  adoptionsLastMonth: number;
  complaintsThisMonth: number;
  complaintsLastMonth: number;
  newAnimalsThisMonth: number;
  newAnimalsLastMonth: number;
  newTutorsThisMonth: number;
  newTutorsLastMonth: number;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: string;
  municipalityId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  municipalityId: string;
  municipality?: {
    id: string;
    name: string;
  };
}

// File upload types
export interface FileUploadResponse {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

// WhatsApp types
export interface WhatsAppMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO';
  mediaUrl?: string;
  isFromBot: boolean;
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'CLOSED' | 'TRANSFERRED';
  tutor?: {
    id: string;
    name: string;
  };
  messages: WhatsAppMessage[];
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ADOPTION' | 'TASK' | 'SYSTEM' | 'ALERT' | 'INFO';
  category: 'ADOCAO' | 'DENUNCIA' | 'CAMPANHA' | 'SISTEMA' | 'VETERINARIO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';

  // Relacionamentos opcionais
  userId?: string;
  animalId?: string;
  adoptionId?: string;
  taskId?: string;

  // Metadados para ações
  actionType?: 'APPROVE' | 'REJECT' | 'VIEW' | 'REDIRECT' | 'COMPLETE';
  actionUrl?: string;
  actionData?: any; // JSON data

  // Timestamps
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos populados
  user?: {
    id: string;
    name: string;
    email: string;
  };
  animal?: {
    id: string;
    name: string;
    species: string;
  };
  adoption?: {
    id: string;
    status: string;
  };
  task?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface NotificationFilters extends FilterParams {
  type?: string;
  category?: string;
  priority?: string;
  status?: string;
  userId?: string;
  animalId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationCreateData {
  title: string;
  message: string;
  type: string;
  category: string;
  priority?: string;
  userId?: string;
  animalId?: string;
  adoptionId?: string;
  taskId?: string;
  actionType?: string;
  actionUrl?: string;
  actionData?: any;
  expiresAt?: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'ADOPTION_REVIEW' | 'DOCUMENT_VERIFICATION' | 'ANIMAL_UPDATE' | 'SYSTEM_MAINTENANCE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Relacionamentos
  createdById: string;
  assignedToId?: string;
  animalId?: string;
  adoptionId?: string;

  // Metadados
  metadata?: any; // JSON data
  dueDate?: string;
  completedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relacionamentos populados
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  animal?: {
    id: string;
    name: string;
    species: string;
  };
  adoption?: {
    id: string;
    status: string;
  };
  notifications?: Notification[];
}

export interface TaskFilters extends FilterParams {
  type?: string;
  status?: string;
  priority?: string;
  createdById?: string;
  assignedToId?: string;
  animalId?: string;
  adoptionId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TaskCreateData {
  title: string;
  description: string;
  type: string;
  priority?: string;
  assignedToId?: string;
  animalId?: string;
  adoptionId?: string;
  metadata?: any;
  dueDate?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  metadata?: any;
  dueDate?: string;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}
