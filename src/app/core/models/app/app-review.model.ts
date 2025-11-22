export interface ReviewCount {
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
    totalReview: number;
    ratingAvg: number;
}

export interface ReviewComment {
    name: string;
    email: string;
    review: string;
    rating: number;
}
