"use client";

import { useState } from "react";
import { Star, ThumbsUp, User, Flag, ChevronDown, Filter } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Textarea } from "~/ui/primitives/textarea";
import { Label } from "~/ui/primitives/label";
import { Progress } from "~/ui/primitives/progress";
import { Separator } from "~/ui/primitives/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/primitives/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/primitives/dialog";
import { Input } from "~/ui/primitives/input";
import { Badge } from "~/ui/primitives/badge";

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Dr. Sarah Johnson",
    rating: 5,
    title: "Excellent quality!",
    content:
      "These dental mirrors are exactly what I needed for my practice. The clarity is outstanding and they feel very durable. Highly recommend for any dental professional.",
    date: "2024-12-20",
    verified: true,
    helpful: 12,
    images: ["/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "2",
    userName: "Michael Chen",
    rating: 4,
    title: "Good value for the price",
    content:
      "Solid product overall. Arrived quickly and well-packaged. Minor issue with one of the items but customer service was helpful. Would buy again.",
    date: "2024-12-15",
    verified: true,
    helpful: 8,
  },
  {
    id: "3",
    userName: "Dr. Emily Rodriguez",
    rating: 5,
    title: "Best purchase for my clinic",
    content:
      "Outstanding product quality! I've been using dental supplies from various vendors, but MK Dental consistently delivers the best. The attention to detail is remarkable.",
    date: "2024-12-10",
    verified: true,
    helpful: 15,
  },
  {
    id: "4",
    userName: "James Wilson",
    rating: 3,
    title: "Average quality",
    content:
      "The product is okay but not exceptional. It does the job but I've seen better quality elsewhere. Delivery was fast though.",
    date: "2024-12-05",
    verified: false,
    helpful: 3,
  },
];

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    content: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100 ||
      0,
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => (filterRating ? review.rating === filterRating : true))
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const handleSubmitReview = () => {
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!newReview.title.trim()) {
      toast.error("Please enter a review title");
      return;
    }
    if (!newReview.content.trim()) {
      toast.error("Please enter your review");
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userName: "You",
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      date: new Date().toISOString().split("T")[0],
      verified: true,
      helpful: 0,
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, title: "", content: "" });
    setShowReviewForm(false);
    toast.success("Thank you for your review!");
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
    toast.success("Thanks for your feedback!");
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? hoveredRating || newReview.rating : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            onClick={() =>
              interactive && setNewReview({ ...newReview, rating: star })
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                {totalReviews} reviews for {productName}
              </CardDescription>
            </div>
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>
                    Share your experience with this product
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    {renderStars(newReview.rating, true)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-title">Review Title</Label>
                    <Input
                      id="review-title"
                      value={newReview.title}
                      onChange={(e) =>
                        setNewReview({ ...newReview, title: e.target.value })
                      }
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-content">Your Review</Label>
                    <Textarea
                      id="review-content"
                      value={newReview.content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewReview({ ...newReview, content: e.target.value })
                      }
                      placeholder="Tell others about your experience with this product"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="text-5xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <div>
                  {renderStars(Math.round(averageRating))}
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {totalReviews} reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  className="flex items-center gap-2 w-full hover:bg-muted/50 rounded p-1 transition-colors"
                  onClick={() =>
                    setFilterRating(filterRating === rating ? null : rating)
                  }
                >
                  <span className="text-sm w-12">
                    {rating} star{rating !== 1 && "s"}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {filterRating && (
            <Badge variant="secondary" className="gap-1">
              {filterRating} Stars
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setFilterRating(null)}
              >
                ×
              </button>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Showing {filteredReviews.length} of {totalReviews} reviews
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Sort by:{" "}
              {sortBy === "newest"
                ? "Newest"
                : sortBy === "oldest"
                ? "Oldest"
                : sortBy === "highest"
                ? "Highest Rated"
                : sortBy === "lowest"
                ? "Lowest Rated"
                : "Most Helpful"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>
              Oldest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("highest")}>
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("lowest")}>
              Lowest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("helpful")}>
              Most Helpful
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback>
                      {review.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium">{review.title}</h4>
                    <p className="text-muted-foreground">{review.content}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {review.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative h-20 w-20 rounded-md overflow-hidden bg-muted"
                          >
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => handleHelpful(review.id)}
                      >
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <Flag className="mr-1 h-4 w-4" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to review this product
              </p>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
