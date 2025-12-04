// API client for Soular Next
// Centralized API calls for films, events, and forum

import type {
  FilmsResponse,
  EventsResponse,
  ForumThreadsResponse,
  ForumPostsResponse,
  Film,
  Event,
  ForumThread,
} from '@/lib/types/database'

const API_BASE = '/api'

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An error occurred',
    }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// FILMS API
// ============================================================================

export interface FilmFilters {
  page?: number
  limit?: number
  genre?: string
  search?: string
  featured?: boolean
}

export const filmsAPI = {
  // Get all films with filters
  getAll: async (filters: FilmFilters = {}): Promise<FilmsResponse> => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.genre) params.append('genre', filters.genre)
    if (filters.search) params.append('search', filters.search)
    if (filters.featured) params.append('featured', 'true')

    const query = params.toString()
    return fetchAPI<FilmsResponse>(`/films${query ? `?${query}` : ''}`)
  },

  // Get single film by ID
  getById: async (id: string) => {
    return fetchAPI<{ film: Film; userInteractions: any }>(`/films/${id}`)
  },

  // Create new film (curator/admin only)
  create: async (filmData: Partial<Film>) => {
    return fetchAPI<{ film: Film; message: string }>('/films', {
      method: 'POST',
      body: JSON.stringify(filmData),
    })
  },

  // Update film (owner/admin only)
  update: async (id: string, filmData: Partial<Film>) => {
    return fetchAPI<{ film: Film; message: string }>(`/films/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(filmData),
    })
  },

  // Delete film (admin only)
  delete: async (id: string) => {
    return fetchAPI<{ message: string }>(`/films/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// EVENTS API
// ============================================================================

export interface EventFilters {
  page?: number
  limit?: number
  type?: string
  upcoming?: boolean
}

export const eventsAPI = {
  // Get all events with filters
  getAll: async (filters: EventFilters = {}): Promise<EventsResponse> => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.type) params.append('type', filters.type)
    if (filters.upcoming) params.append('upcoming', 'true')

    const query = params.toString()
    return fetchAPI<EventsResponse>(`/events${query ? `?${query}` : ''}`)
  },

  // Get single event by ID
  getById: async (id: string) => {
    return fetchAPI<{ event: Event }>(`/events/${id}`)
  },

  // Create new event (curator/admin only)
  create: async (eventData: Partial<Event>) => {
    return fetchAPI<{ event: Event; message: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  },

  // Register for event
  register: async (
    eventId: string,
    registrationData?: Record<string, any>
  ) => {
    return fetchAPI<{ registration: any; message: string }>(
      `/events/${eventId}/register`,
      {
        method: 'POST',
        body: JSON.stringify({ registration_data: registrationData }),
      }
    )
  },

  // Cancel registration
  unregister: async (eventId: string) => {
    return fetchAPI<{ message: string }>(`/events/${eventId}/register`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// FORUM API
// ============================================================================

export interface ForumFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export const forumAPI = {
  // Get all threads with filters
  getThreads: async (
    filters: ForumFilters = {}
  ): Promise<ForumThreadsResponse> => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)

    const query = params.toString()
    return fetchAPI<ForumThreadsResponse>(`/forum${query ? `?${query}` : ''}`)
  },

  // Create new thread
  createThread: async (threadData: {
    title: string
    content: string
    category?: string
  }) => {
    return fetchAPI<{ thread: ForumThread; message: string }>('/forum', {
      method: 'POST',
      body: JSON.stringify(threadData),
    })
  },

  // Get posts for a thread
  getPosts: async (threadId: string, page = 1, limit = 50) => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    return fetchAPI<ForumPostsResponse>(
      `/forum/${threadId}/posts?${params.toString()}`
    )
  },

  // Create post/reply in thread
  createPost: async (
    threadId: string,
    content: string,
    parentPostId?: string
  ) => {
    return fetchAPI<{ post: any; message: string }>(
      `/forum/${threadId}/posts`,
      {
        method: 'POST',
        body: JSON.stringify({ content, parent_post_id: parentPostId }),
      }
    )
  },
}

// ============================================================================
// UPLOAD API
// ============================================================================

export const uploadAPI = {
  // Upload file to storage
  upload: async (
    file: File,
    bucket: string,
    folder?: string
  ): Promise<{ url: string; path: string; bucket: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    if (folder) formData.append('folder', folder)

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Upload failed',
      }))
      throw new Error(error.error || 'Upload failed')
    }

    return response.json()
  },

  // Delete file from storage
  delete: async (bucket: string, path: string) => {
    return fetchAPI<{ message: string }>('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ bucket, path }),
    })
  },
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  // Sign up
  signup: async (
    email: string,
    password: string,
    metadata?: { full_name?: string; username?: string }
  ) => {
    return fetchAPI<{ user: any; session: any; message: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, ...metadata }),
      }
    )
  },

  // Sign in
  signin: async (email: string, password: string) => {
    return fetchAPI<{ user: any; session: any; message: string }>(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
  },

  // Sign out
  signout: async () => {
    return fetchAPI<{ message: string }>('/auth/signout', {
      method: 'POST',
    })
  },
}

// ============================================================================
// COLLECTIONS API (for future implementation)
// ============================================================================

export const collectionsAPI = {
  // Placeholder for collections endpoints
  // These can be implemented when needed
}
