/**
 * Forum Helper Functions
 *
 * Helper functions for working with forum discussions and posts in Supabase.
 * These functions handle common operations like creating discussions, posting replies,
 * liking posts, and managing forum content.
 */

import { createClient } from "@/lib/supabase/client";

export type ForumCategory =
    | "general"
    | "filmmaking"
    | "technical"
    | "showcase"
    | "feedback"
    | "events"
    | "other";

export interface ForumDiscussion {
    id: string;
    title: string;
    content: string;
    author_id: string;
    category: ForumCategory;
    tags: string[];
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
}

export interface ForumPost {
    id: string;
    discussion_id: string;
    author_id: string;
    content: string;
    parent_post_id: string | null;
    is_solution: boolean;
    like_count: number;
    created_at: string;
    updated_at: string;
}

export interface ForumPostLike {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface DiscussionWithAuthor extends ForumDiscussion {
    author?: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

export interface PostWithAuthor extends ForumPost {
    author?: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

/**
 * Fetch all discussions with optional filtering
 */
export async function getDiscussions(options?: {
    category?: ForumCategory;
    limit?: number;
    offset?: number;
    includeAuthor?: boolean;
}): Promise<{ data: ForumDiscussion[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        let query = supabase
            .from("forum_discussions")
            .select(
                options?.includeAuthor
                    ? "*, author:profiles!author_id(id, name, avatar)"
                    : "*",
            )
            .order("is_pinned", { ascending: false })
            .order("last_activity_at", { ascending: false });

        if (options?.category) {
            query = query.eq("category", options.category);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(
                options.offset,
                options.offset + (options.limit || 10) - 1,
            );
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data: data as unknown as ForumDiscussion[], error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Fetch a single discussion by ID
 */
export async function getDiscussionById(
    id: string,
    includeAuthor = false,
): Promise<{ data: ForumDiscussion | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .select(
                includeAuthor
                    ? "*, author:profiles!author_id(id, name, avatar)"
                    : "*",
            )
            .eq("id", id)
            .single();

        if (error) throw error;

        return { data: data as unknown as ForumDiscussion, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Create a new discussion
 */
export async function createDiscussion(discussion: {
    title: string;
    content: string;
    author_id: string;
    category: ForumCategory;
    tags?: string[];
}): Promise<{ data: ForumDiscussion | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .insert({
                title: discussion.title,
                content: discussion.content,
                author_id: discussion.author_id,
                category: discussion.category,
                tags: discussion.tags || [],
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Update a discussion
 */
export async function updateDiscussion(
    id: string,
    updates: Partial<Pick<ForumDiscussion, "title" | "content" | "tags">>,
): Promise<{ data: ForumDiscussion | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Delete a discussion
 */
export async function deleteDiscussion(
    id: string,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("forum_discussions")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Increment discussion view count
 */
export async function incrementDiscussionViews(
    id: string,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase.rpc("increment_discussion_views", {
            discussion_uuid: id,
        });

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get posts for a discussion
 */
export async function getDiscussionPosts(
    discussionId: string,
    includeAuthor = false,
): Promise<{ data: ForumPost[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_posts")
            .select(
                includeAuthor
                    ? "*, author:profiles!author_id(id, name, avatar)"
                    : "*",
            )
            .eq("discussion_id", discussionId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return { data: data as unknown as ForumPost[], error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Create a new post (reply)
 */
export async function createPost(post: {
    discussion_id: string;
    author_id: string;
    content: string;
    parent_post_id?: string;
}): Promise<{ data: ForumPost | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_posts")
            .insert({
                discussion_id: post.discussion_id,
                author_id: post.author_id,
                content: post.content,
                parent_post_id: post.parent_post_id || null,
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Update a post
 */
export async function updatePost(
    id: string,
    updates: Partial<Pick<ForumPost, "content" | "is_solution">>,
): Promise<{ data: ForumPost | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_posts")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("forum_posts")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Like a post
 */
export async function likePost(
    postId: string,
    userId: string,
): Promise<{ data: ForumPostLike | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_post_likes")
            .insert({
                post_id: postId,
                user_id: userId,
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Unlike a post
 */
export async function unlikePost(
    postId: string,
    userId: string,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("forum_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(
    postId: string,
    userId: string,
): Promise<{ liked: boolean; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("has_user_liked_post", {
            post_uuid: postId,
            user_uuid: userId,
        });

        if (error) throw error;

        return { liked: data || false, error: null };
    } catch (error) {
        return { liked: false, error: error as Error };
    }
}

/**
 * Get discussion statistics
 */
export async function getDiscussionStats(discussionId: string): Promise<{
    data: {
        post_count: number;
        view_count: number;
        last_activity: string;
    } | null;
    error: Error | null;
}> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("get_discussion_stats", {
            discussion_uuid: discussionId,
        });

        if (error) throw error;

        return {
            data: data?.[0] || null,
            error: null,
        };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Search discussions by title or content
 */
export async function searchDiscussions(
    query: string,
): Promise<{ data: ForumDiscussion[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .select("*")
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order("last_activity_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get discussions by tag
 */
export async function getDiscussionsByTag(
    tag: string,
): Promise<{ data: ForumDiscussion[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .select("*")
            .contains("tags", [tag])
            .order("last_activity_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get posts by user
 */
export async function getUserPosts(
    userId: string,
): Promise<{ data: ForumPost[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_posts")
            .select("*")
            .eq("author_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get discussions by user
 */
export async function getUserDiscussions(
    userId: string,
): Promise<{ data: ForumDiscussion[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("forum_discussions")
            .select("*")
            .eq("author_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Pin/unpin a discussion (admin only)
 */
export async function toggleDiscussionPin(
    id: string,
    isPinned: boolean,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("forum_discussions")
            .update({ is_pinned: isPinned })
            .eq("id", id);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Lock/unlock a discussion (admin only)
 */
export async function toggleDiscussionLock(
    id: string,
    isLocked: boolean,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("forum_discussions")
            .update({ is_locked: isLocked })
            .eq("id", id);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}
