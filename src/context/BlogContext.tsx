import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { defaultBlogPosts } from "@/data/blog-posts";
import { BlogPost, BlogPostInput } from "@/types/blog";
import { BlogPostsService } from "@/lib/supabase";

interface BlogContextValue {
  posts: BlogPost[];
  publishedPosts: BlogPost[];
  categories: string[];
  createPost: (input: BlogPostInput) => Promise<BlogPost>;
  updatePost: (slug: string, updates: BlogPostInput) => Promise<BlogPost | undefined>;
  deletePost: (slug: string) => Promise<void>;
  togglePublished: (slug: string) => Promise<void>;
  getPostBySlug: (slug: string) => BlogPost | undefined;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ensureUniqueSlug = (slug: string, taken: string[]): string => {
  if (!taken.includes(slug)) {
    return slug;
  }
  let attempt = 2;
  let next = `${slug}-${attempt}`;
  while (taken.includes(next)) {
    attempt += 1;
    next = `${slug}-${attempt}`;
  }
  return next;
};

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

const normaliseTags = (tags: string[]): string[] =>
  tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `blog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>(defaultBlogPosts);
  const [isLoading, setIsLoading] = useState(true);

  // Load blog posts from Supabase on mount
  useEffect(() => {
    loadBlogPosts();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = BlogPostsService.subscribeToChanges((supabasePosts) => {
      console.log('🔄 Blog posts synced from Supabase (cross-browser sync)');
      const clientPosts = supabasePosts.map(BlogPostsService.convertToClientFormat);
      setPosts(clientPosts);
    });

    return unsubscribe;
  }, []);

  const loadBlogPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabasePosts = await BlogPostsService.getBlogPosts();
      if (supabasePosts && supabasePosts.length > 0) {
        const clientPosts = supabasePosts.map(BlogPostsService.convertToClientFormat);
        setPosts(clientPosts);
        console.log('✅ Blog posts loaded from Supabase');
      } else {
        // If no posts in database, use default posts and sync them
        console.log('📝 No blog posts in database, using defaults');
        setPosts(defaultBlogPosts);

        // Sync default posts to database
        const dbPosts = defaultBlogPosts.map(BlogPostsService.convertToDatabaseFormat);
        await BlogPostsService.updateBlogPosts(dbPosts);
      }
    } catch (error) {
      console.error('Failed to load blog posts from Supabase:', error);
      setPosts(defaultBlogPosts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (input: BlogPostInput): Promise<BlogPost> => {
    const now = new Date().toISOString();
    const safeTags = normaliseTags(input.tags);
    const existingSlugs = posts.map((post) => post.slug);
    const baseSlug = slugify(input.slug || input.title);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);
    const newPost: BlogPost = {
      id: generateId(),
      slug,
      title: input.title,
      excerpt: input.excerpt,
      author: input.author,
      category: input.category,
      tags: safeTags,
      coverImage: input.coverImage,
      content: input.content,
      published: input.published ?? false,
      readTime: input.readTime,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const dbPost = BlogPostsService.convertToDatabaseFormat(newPost);
      const success = await BlogPostsService.addBlogPost(dbPost);

      if (success) {
        setPosts((prev) => [...prev, newPost]);
        console.log('✅ Blog post created in Supabase');
      } else {
        throw new Error('Failed to create blog post in database');
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
    }

    return newPost;
  }, [posts]);

  const updatePost = useCallback(async (slug: string, updates: BlogPostInput): Promise<BlogPost | undefined> => {
    let updatedPost: BlogPost | undefined;

    try {
      const existing = posts.find((post) => post.slug === slug);
      if (!existing) {
        return undefined;
      }

      const now = new Date().toISOString();
      const safeTags = normaliseTags(updates.tags);
      const otherSlugs = posts.filter((post) => post.slug !== slug).map((post) => post.slug);
      const baseSlug = slugify(updates.slug || updates.title);
      const nextSlug = ensureUniqueSlug(baseSlug || existing.slug, otherSlugs);

      updatedPost = {
        ...existing,
        ...updates,
        tags: safeTags,
        slug: nextSlug,
        published: updates.published ?? existing.published,
        updatedAt: now,
      };

      const dbPost = BlogPostsService.convertToDatabaseFormat(updatedPost);
      const success = await BlogPostsService.updateBlogPost(dbPost);

      if (success) {
        setPosts((prev) => prev.map((post) => (post.slug === slug ? updatedPost as BlogPost : post)));
        console.log('✅ Blog post updated in Supabase');
      } else {
        throw new Error('Failed to update blog post in database');
      }
    } catch (error) {
      console.error('Failed to update blog post:', error);
    }

    return updatedPost;
  }, [posts]);

  const deletePost = useCallback(async (slug: string) => {
    try {
      const success = await BlogPostsService.deleteBlogPost(slug);

      if (success) {
        setPosts((prev) => prev.filter((post) => post.slug !== slug));
        console.log('✅ Blog post deleted from Supabase');
      } else {
        throw new Error('Failed to delete blog post from database');
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    }
  }, []);

  const togglePublished = useCallback(async (slug: string) => {
    try {
      const existing = posts.find((post) => post.slug === slug);
      if (!existing) return;

      const updatedPost = {
        ...existing,
        published: !existing.published,
        updatedAt: new Date().toISOString()
      };

      const dbPost = BlogPostsService.convertToDatabaseFormat(updatedPost);
      const success = await BlogPostsService.updateBlogPost(dbPost);

      if (success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.slug === slug ? updatedPost : post
          ),
        );
        console.log('✅ Blog post publish status updated in Supabase');
      } else {
        throw new Error('Failed to update blog post publish status in database');
      }
    } catch (error) {
      console.error('Failed to toggle blog post publish status:', error);
    }
  }, [posts]);

  const getPostBySlug = useCallback((slug: string): BlogPost | undefined => {
    return posts.find((post) => post.slug === slug);
  }, [posts]);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      }),
    [posts],
  );

  const publishedPosts = useMemo(() => sortedPosts.filter((post) => post.published), [sortedPosts]);

  const categories = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.category))).sort();
  }, [posts]);

  const value = useMemo<BlogContextValue>(
    () => ({
      posts: sortedPosts,
      publishedPosts,
      categories,
      createPost,
      updatePost,
      deletePost,
      togglePublished,
      getPostBySlug,
    }),
    [sortedPosts, publishedPosts, categories, createPost, updatePost, deletePost, togglePublished, getPostBySlug],
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlogContext = (): BlogContextValue => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlogContext must be used within a BlogProvider");
  }
  return context;
};
