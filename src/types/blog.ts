export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  content: string[];
  published: boolean;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  content: string[];
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
  published?: boolean;
}
