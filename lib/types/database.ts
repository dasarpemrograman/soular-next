// Database Types for Soular Next
// Auto-generated types based on Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'curator' | 'admin'
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'curator' | 'admin'
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'curator' | 'admin'
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      films: {
        Row: {
          id: string
          title: string
          slug: string
          synopsis: string | null
          description: string | null
          director: string | null
          year: number | null
          duration: number | null
          genre: string[] | null
          tags: string[] | null
          language: string | null
          country: string | null
          poster_url: string | null
          thumbnail_url: string | null
          video_url: string | null
          trailer_url: string | null
          is_premium: boolean
          is_published: boolean
          view_count: number
          rating: number
          curator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          synopsis?: string | null
          description?: string | null
          director?: string | null
          year?: number | null
          duration?: number | null
          genre?: string[] | null
          tags?: string[] | null
          language?: string | null
          country?: string | null
          poster_url?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          trailer_url?: string | null
          is_premium?: boolean
          is_published?: boolean
          view_count?: number
          rating?: number
          curator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          synopsis?: string | null
          description?: string | null
          director?: string | null
          year?: number | null
          duration?: number | null
          genre?: string[] | null
          tags?: string[] | null
          language?: string | null
          country?: string | null
          poster_url?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          trailer_url?: string | null
          is_premium?: boolean
          is_published?: boolean
          view_count?: number
          rating?: number
          curator_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      film_credits: {
        Row: {
          id: string
          film_id: string | null
          person_name: string
          role: 'actor' | 'director' | 'producer' | 'writer' | 'cinematographer' | 'editor' | 'composer'
          character_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          film_id?: string | null
          person_name: string
          role: 'actor' | 'director' | 'producer' | 'writer' | 'cinematographer' | 'editor' | 'composer'
          character_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          film_id?: string | null
          person_name?: string
          role?: 'actor' | 'director' | 'producer' | 'writer' | 'cinematographer' | 'editor' | 'composer'
          character_name?: string | null
          created_at?: string
        }
      }
      film_favorites: {
        Row: {
          id: string
          user_id: string | null
          film_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          created_at?: string
        }
      }
      film_ratings: {
        Row: {
          id: string
          user_id: string | null
          film_id: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      watch_progress: {
        Row: {
          id: string
          user_id: string | null
          film_id: string | null
          progress_seconds: number
          completed: boolean
          last_watched_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          progress_seconds?: number
          completed?: boolean
          last_watched_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          film_id?: string | null
          progress_seconds?: number
          completed?: boolean
          last_watched_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          location: string | null
          location_type: 'online' | 'offline' | 'hybrid' | null
          event_type: 'screening' | 'workshop' | 'discussion' | 'festival' | 'other' | null
          start_date: string
          end_date: string | null
          image_url: string | null
          capacity: number | null
          attendee_count: number
          registration_url: string | null
          is_free: boolean
          price: number | null
          organizer_id: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          location?: string | null
          location_type?: 'online' | 'offline' | 'hybrid' | null
          event_type?: 'screening' | 'workshop' | 'discussion' | 'festival' | 'other' | null
          start_date: string
          end_date?: string | null
          image_url?: string | null
          capacity?: number | null
          attendee_count?: number
          registration_url?: string | null
          is_free?: boolean
          price?: number | null
          organizer_id?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          location?: string | null
          location_type?: 'online' | 'offline' | 'hybrid' | null
          event_type?: 'screening' | 'workshop' | 'discussion' | 'festival' | 'other' | null
          start_date?: string
          end_date?: string | null
          image_url?: string | null
          capacity?: number | null
          attendee_count?: number
          registration_url?: string | null
          is_free?: boolean
          price?: number | null
          organizer_id?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string | null
          user_id: string | null
          status: 'registered' | 'attended' | 'cancelled'
          registration_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          status?: 'registered' | 'attended' | 'cancelled'
          registration_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          status?: 'registered' | 'attended' | 'cancelled'
          registration_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          category: 'general' | 'film-discussion' | 'technical' | 'events' | 'feedback' | null
          author_id: string | null
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          reply_count: number
          last_activity_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          category?: 'general' | 'film-discussion' | 'technical' | 'events' | 'feedback' | null
          author_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          category?: 'general' | 'film-discussion' | 'technical' | 'events' | 'feedback' | null
          author_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          thread_id: string | null
          content: string
          author_id: string | null
          parent_post_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          content: string
          author_id?: string | null
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          content?: string
          author_id?: string | null
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          curator_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          curator_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          curator_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      collection_films: {
        Row: {
          id: string
          collection_id: string | null
          film_id: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          collection_id?: string | null
          film_id?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          collection_id?: string | null
          film_id?: string | null
          position?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string | null
          link_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message?: string | null
          link_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string | null
          link_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_film_views: {
        Args: { film_id_param: string }
        Returns: void
      }
      increment_thread_views: {
        Args: { thread_id_param: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Film = Database['public']['Tables']['films']['Row']
export type FilmCredit = Database['public']['Tables']['film_credits']['Row']
export type FilmFavorite = Database['public']['Tables']['film_favorites']['Row']
export type FilmRating = Database['public']['Tables']['film_ratings']['Row']
export type WatchProgress = Database['public']['Tables']['watch_progress']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventRegistration = Database['public']['Tables']['event_registrations']['Row']
export type ForumThread = Database['public']['Tables']['forum_threads']['Row']
export type ForumPost = Database['public']['Tables']['forum_posts']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type CollectionFilm = Database['public']['Tables']['collection_films']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type FilmInsert = Database['public']['Tables']['films']['Insert']
export type FilmCreditInsert = Database['public']['Tables']['film_credits']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type ForumThreadInsert = Database['public']['Tables']['forum_threads']['Insert']
export type ForumPostInsert = Database['public']['Tables']['forum_posts']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type FilmUpdate = Database['public']['Tables']['films']['Update']
export type EventUpdate = Database['public']['Tables']['events']['Update']

// Extended types with relations
export type FilmWithCurator = Film & {
  curator: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

export type FilmWithCredits = Film & {
  curator: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
  credits: FilmCredit[]
}

export type EventWithOrganizer = Event & {
  organizer: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

export type ForumThreadWithAuthor = ForumThread & {
  author: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

export type ForumPostWithAuthor = ForumPost & {
  author: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

// Pagination type
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API Response types
export interface FilmsResponse {
  films: FilmWithCurator[]
  pagination: PaginationMeta
}

export interface EventsResponse {
  events: EventWithOrganizer[]
  pagination: PaginationMeta
}

export interface ForumThreadsResponse {
  threads: ForumThreadWithAuthor[]
  pagination: PaginationMeta
}

export interface ForumPostsResponse {
  posts: ForumPostWithAuthor[]
  pagination: PaginationMeta
}
