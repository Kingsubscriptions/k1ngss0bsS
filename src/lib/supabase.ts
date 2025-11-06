import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AdminSettings {
  id?: number
  whatsapp_number?: string
  whatsapp_direct_order?: boolean
  enable_purchase_notifications?: boolean
  enable_floating_cart?: boolean
  show_discount_badges?: boolean
  show_breadcrumbs?: boolean
  popup_settings?: any
  updated_at?: string
}

export interface ProductData {
  id: string
  name: string
  category: string
  description?: string
  features?: string[] // JSON array
  image?: string
  popular?: boolean
  badge?: string
  price?: any // JSON object
  stock?: any // JSON - can be boolean, number, or string
  created_at?: string
  updated_at?: string
}

// Admin settings service
export class AdminSettingsService {
  private static readonly TABLE_NAME = 'admin_settings'

  static async getSettings(): Promise<AdminSettings | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching admin settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getSettings:', error)
      return null
    }
  }

  static async updateSettings(settings: Partial<AdminSettings>): Promise<boolean> {
    try {
      // First, try to get existing settings
      const existing = await this.getSettings()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) {
          console.error('Error updating admin settings:', error)
          return false
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...settings,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error inserting admin settings:', error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in updateSettings:', error)
      return false
    }
  }

  static subscribeToChanges(callback: (settings: AdminSettings) => void) {
    const subscription = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        (payload) => {
          console.log('🔄 Admin settings changed in database:', payload)
          if (payload.new) {
            callback(payload.new as AdminSettings)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}

// Products service
export class ProductsService {
  private static readonly TABLE_NAME = 'products'

  static async getProducts(): Promise<ProductData[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  }

  static async updateProducts(products: ProductData[]): Promise<boolean> {
    try {
      // First, delete all existing products
      const { error: deleteError } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .neq('id', 'impossible-id') // Delete all rows

      if (deleteError) {
        console.error('Error deleting existing products:', deleteError)
        return false
      }

      // Then insert all new products
      if (products.length > 0) {
        const productsToInsert = products.map(product => ({
          ...product,
          features: JSON.stringify(product.features || []),
          price: JSON.stringify(product.price || {}),
          stock: JSON.stringify(product.stock || false),
          updated_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabase
          .from(this.TABLE_NAME)
          .insert(productsToInsert)

        if (insertError) {
          console.error('Error inserting products:', insertError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in updateProducts:', error)
      return false
    }
  }

  static async addProduct(product: ProductData): Promise<boolean> {
    try {
      const productToInsert = {
        ...product,
        features: JSON.stringify(product.features || []),
        price: JSON.stringify(product.price || {}),
        stock: JSON.stringify(product.stock || false),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert([productToInsert])

      if (error) {
        console.error('Error adding product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in addProduct:', error)
      return false
    }
  }

  static async updateProduct(product: ProductData): Promise<boolean> {
    try {
      const productToUpdate = {
        ...product,
        features: JSON.stringify(product.features || []),
        price: JSON.stringify(product.price || {}),
        stock: JSON.stringify(product.stock || false),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(productToUpdate)
        .eq('id', product.id)

      if (error) {
        console.error('Error updating product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return false
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      return false
    }
  }

  static subscribeToChanges(callback: (products: ProductData[]) => void) {
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        async (payload) => {
          console.log('🔄 Products changed in database:', payload)
          // Reload all products when any change occurs
          const products = await this.getProducts()
          callback(products)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  // Convert database product to client format
  static convertToClientFormat(dbProduct: ProductData): any {
    return {
      ...dbProduct,
      features: typeof dbProduct.features === 'string' 
        ? JSON.parse(dbProduct.features) 
        : dbProduct.features || [],
      price: typeof dbProduct.price === 'string' 
        ? JSON.parse(dbProduct.price) 
        : dbProduct.price || {},
      stock: typeof dbProduct.stock === 'string' 
        ? JSON.parse(dbProduct.stock) 
        : dbProduct.stock || false,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at
    }
  }

  // Convert client product to database format
  static convertToDatabaseFormat(clientProduct: any): ProductData {
    return {
      id: clientProduct.id,
      name: clientProduct.name,
      category: clientProduct.category,
      description: clientProduct.description,
      features: clientProduct.features || [],
      image: clientProduct.image,
      popular: clientProduct.popular || false,
      badge: clientProduct.badge,
      price: clientProduct.price || {},
      stock: clientProduct.stock || false,
      created_at: clientProduct.createdAt || new Date().toISOString(),
      updated_at: clientProduct.updatedAt || new Date().toISOString()
    }
  }
}

// SEO Settings Service
export class SeoSettingsService {
  private static readonly TABLE_NAME = 'seo_settings'

  static async getSeoSettings(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching SEO settings:', error)
        return {}
      }

      return data?.settings || {}
    } catch (error) {
      console.error('Error in getSeoSettings:', error)
      return {}
    }
  }

  static async updateSeoSettings(settings: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          id: 1, // Single row for all SEO settings
          settings: settings,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating SEO settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateSeoSettings:', error)
      return false
    }
  }

  static subscribeToChanges(callback: (settings: Record<string, any>) => void) {
    const subscription = supabase
      .channel('seo_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        async (payload) => {
          console.log('🔄 SEO settings changed in database:', payload)
          if (payload.new) {
            callback((payload.new as any).settings || {})
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}

// Blog Posts Service
export class BlogPostsService {
  private static readonly TABLE_NAME = 'blog_posts'

  static async getBlogPosts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getBlogPosts:', error)
      return []
    }
  }

  static async updateBlogPosts(posts: any[]): Promise<boolean> {
    try {
      // First, delete all existing posts
      const { error: deleteError } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .neq('id', 'impossible-id')

      if (deleteError) {
        console.error('Error deleting existing blog posts:', deleteError)
        return false
      }

      // Then insert all new posts
      if (posts.length > 0) {
        const postsToInsert = posts.map(post => ({
          ...post,
          tags: JSON.stringify(post.tags || []),
          content: JSON.stringify(post.content || []),
          updated_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabase
          .from(this.TABLE_NAME)
          .insert(postsToInsert)

        if (insertError) {
          console.error('Error inserting blog posts:', insertError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in updateBlogPosts:', error)
      return false
    }
  }

  static async addBlogPost(post: any): Promise<boolean> {
    try {
      const postToInsert = {
        ...post,
        tags: JSON.stringify(post.tags || []),
        content: JSON.stringify(post.content || []),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert([postToInsert])

      if (error) {
        console.error('Error adding blog post:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in addBlogPost:', error)
      return false
    }
  }

  static async updateBlogPost(post: any): Promise<boolean> {
    try {
      const postToUpdate = {
        ...post,
        tags: JSON.stringify(post.tags || []),
        content: JSON.stringify(post.content || []),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(postToUpdate)
        .eq('id', post.id)

      if (error) {
        console.error('Error updating blog post:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateBlogPost:', error)
      return false
    }
  }

  static async deleteBlogPost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting blog post:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteBlogPost:', error)
      return false
    }
  }

  static subscribeToChanges(callback: (posts: any[]) => void) {
    const subscription = supabase
      .channel('blog_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        async (payload) => {
          console.log('🔄 Blog posts changed in database:', payload)
          const posts = await this.getBlogPosts()
          callback(posts)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  // Convert database post to client format
  static convertToClientFormat(dbPost: any): any {
    return {
      ...dbPost,
      tags: typeof dbPost.tags === 'string' ? JSON.parse(dbPost.tags) : dbPost.tags || [],
      content: typeof dbPost.content === 'string' ? JSON.parse(dbPost.content) : dbPost.content || [],
      createdAt: dbPost.created_at,
      updatedAt: dbPost.updated_at
    }
  }

  // Convert client post to database format
  static convertToDatabaseFormat(clientPost: any): any {
    return {
      id: clientPost.id,
      slug: clientPost.slug,
      title: clientPost.title,
      excerpt: clientPost.excerpt,
      author: clientPost.author,
      category: clientPost.category,
      tags: clientPost.tags || [],
      coverImage: clientPost.coverImage,
      content: clientPost.content || [],
      published: clientPost.published || false,
      readTime: clientPost.readTime,
      metaTitle: clientPost.metaTitle,
      metaDescription: clientPost.metaDescription,
      created_at: clientPost.createdAt || new Date().toISOString(),
      updated_at: clientPost.updatedAt || new Date().toISOString()
    }
  }
}

// Popup Settings Service
export class PopupSettingsService {
  private static readonly TABLE_NAME = 'popup_settings'

  static async getPopupSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching popup settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getPopupSettings:', error)
      return null
    }
  }

  static async updatePopupSettings(settings: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          id: 1, // Single row for popup settings
          ...settings,
          pages: JSON.stringify(settings.pages || []),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating popup settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updatePopupSettings:', error)
      return false
    }
  }

  static subscribeToChanges(callback: (settings: any) => void) {
    const subscription = supabase
      .channel('popup_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        async (payload) => {
          console.log('🔄 Popup settings changed in database:', payload)
          if (payload.new) {
            const settings = payload.new as any
            settings.pages = typeof settings.pages === 'string' ? JSON.parse(settings.pages) : settings.pages || []
            callback(settings)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}

// Custom Pages Service
export interface CustomPage {
  id: string
  slug: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  published: boolean
  created_at?: string
  updated_at?: string
}

export class CustomPagesService {
  private static readonly TABLE_NAME = 'custom_pages'

  static async getPages(): Promise<CustomPage[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching custom pages:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPages:', error)
      return []
    }
  }

  static async addPage(page: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const pageToInsert = {
        ...page,
        id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert([pageToInsert])

      if (error) {
        console.error('Error adding custom page:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in addPage:', error)
      return false
    }
  }

  static async updatePage(page: CustomPage): Promise<boolean> {
    try {
      const pageToUpdate = {
        ...page,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(pageToUpdate)
        .eq('id', page.id)

      if (error) {
        console.error('Error updating custom page:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updatePage:', error)
      return false
    }
  }

  static async deletePage(pageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', pageId)

      if (error) {
        console.error('Error deleting custom page:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deletePage:', error)
      return false
    }
  }

  static async getPageBySlug(slug: string): Promise<CustomPage | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching page by slug:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getPageBySlug:', error)
      return null
    }
  }

  static subscribeToChanges(callback: (pages: CustomPage[]) => void) {
    const subscription = supabase
      .channel('custom_pages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_NAME
        },
        async (payload) => {
          console.log('🔄 Custom pages changed in database:', payload)
          const pages = await this.getPages()
          callback(pages)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}
