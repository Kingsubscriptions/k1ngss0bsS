import React, { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Eye, ArrowLeft } from "lucide-react";
import { useBlogContext } from "@/context/BlogContext";
import { useSeo } from '@/context/SeoContext';

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, publishedPosts } = useBlogContext();
  const post = slug ? getPostBySlug(slug) : undefined;

  const related = useMemo(() => {
    if (!post) return [];
    return publishedPosts
      .filter((item) => item.slug !== post.slug && item.category === post.category)
      .slice(0, 3);
  }, [post, publishedPosts]);

  useSeo('blog-post', post ? {
    title: post.metaTitle || `${post.title} | Kings Subscriptions`,
    description: post.metaDescription || post.excerpt,
  } : {
    title: 'Article Not Found | Kings Subscriptions',
    description: 'Blog article not available right now.',
  });

  if (!post) {
    return (
      <div className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle>Article not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The blog post you are looking for may have been unpublished or moved.
              </p>
              <Link to="/blog">
                <Button variant="outline">Back to Blog</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paragraphs = post.content.length > 0 ? post.content : [post.excerpt];

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Link>
        </div>

        <header className="space-y-4 mb-8">
          <Badge className="w-fit">{post.category}</Badge>
          <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {post.readTime}
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <article className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-foreground/90">
              {paragraph}
            </p>
          ))}
        </article>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Card key={item.slug} className="hover:shadow-md transition-shadow">
                  <Link to={`/blog/${item.slug}`}>
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">{item.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.excerpt}</p>
                    <Link to={`/blog/${item.slug}`} className="text-sm text-primary hover:underline">
                      Read more
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
