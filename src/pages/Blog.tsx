import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
    month: "short",
    day: "numeric",
  });
};

const Blog: React.FC = () => {
  const { publishedPosts, categories } = useBlogContext();
  const categoryOptions = useMemo(() => ["All", ...categories], [categories]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 3;
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  const filteredPosts = useMemo(() => {
    const base = selectedCategory === "All"
      ? publishedPosts
      : publishedPosts.filter((post) => post.category === selectedCategory);
    return base;
  }, [publishedPosts, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const heroPost = filteredPosts[0];
  const otherPosts = heroPost ? filteredPosts.slice(1) : filteredPosts;

  useSeo('blog', heroPost ? {
    title: heroPost.metaTitle || heroPost.title,
    description: heroPost.metaDescription || heroPost.excerpt,
  } : undefined);

  const totalPages = otherPosts.length > 0 ? Math.ceil(otherPosts.length / postsPerPage) : 0;
  const pagePosts = totalPages > 0
    ? otherPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
    : otherPosts;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Knowledge Hub</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how to save money, maximise productivity, and scale your business with step-by-step playbooks from the King Subs team.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryOptions.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Article */}
        {heroPost ? (
          <Card className="overflow-hidden mb-12">
            <div className="grid md:grid-cols-2">
              <div className="relative h-full">
                <img
                  src={heroPost.coverImage}
                  alt={heroPost.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <Badge className="mb-4 w-fit">{heroPost.category}</Badge>
                  <h2 className="text-3xl font-bold mb-4">{heroPost.title}</h2>
                  <p className="text-muted-foreground mb-6 text-lg">{heroPost.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {heroPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(heroPost.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {heroPost.readTime}
                    </div>
                  </div>
                </div>
                <Link to={`/blog/${heroPost.slug}`} aria-label={`Read article: ${heroPost.title}`}>
                  <Button className="w-fit">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-12">
            <CardContent className="p-10 text-center text-muted-foreground">
              No published articles yet. Check back soon!
            </CardContent>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pagePosts.map((post) => (
            <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/blog/${post.slug}`} aria-label={`Read article: ${post.title}`}>
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </Link>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get the latest money-saving tips, tool reviews, and exclusive deals delivered to your inbox.
            </p>
            <form
              className="flex flex-col md:flex-row gap-2 max-w-md mx-auto"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newsletterEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
                  setNewsletterStatus("Please enter a valid email address.");
                  return;
                }
                setNewsletterStatus("Subscribed! Check your inbox for confirmation.");
                setNewsletterEmail("");
              }}
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md border bg-background focus:outline-primary"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
                aria-label="Email address"
              />
              <Button type="submit">Subscribe</Button>
            </form>
            {newsletterStatus && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">{newsletterStatus}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;

