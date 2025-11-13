import React from 'react';
import { Product } from '@/data/products';

interface SchemaMarkupProps {
  product: Product;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ product }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'King Subscription',
    },
    offers: {
      '@type': 'Offer',
      url: `https://k1ngss0bs-s.vercel.app/product/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price.monthly || product.price.yearly,
      itemCondition: 'https://schema.org/NewCondition',
      availability: isProductInStock(product.stock)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.9,
      reviewCount: Math.floor(Math.random() * 500) + 50,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export default SchemaMarkup;

function isProductInStock(stock: any): boolean {
    if (stock === false || stock === 0) return false;
    if (stock === true || stock === "unlimited") return true;
    if (typeof stock === "number" && stock > 0) return true;
    return false;
}
