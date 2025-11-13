import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReviews, Review } from '@/context/ReviewsContext';
import { Check, Trash2 } from 'lucide-react';

const ReviewManagement: React.FC = () => {
  const { reviews, loading, error, approveReview, deleteReview } = useReviews();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-card/60 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-muted-foreground">Product ID: {review.product_id}</p>
                    <p className="text-sm">Rating: {review.rating}/5</p>
                  </div>
                  <div className="flex gap-2">
                    {!review.is_approved && (
                      <Button size="sm" variant="outline" onClick={() => approveReview(review.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewManagement;
