export const WISHLIST_STATUSES = ["Wichtig", "Idee", "Später"] as const;
export type WishlistStatus = (typeof WISHLIST_STATUSES)[number];

export type WishlistItem = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number | null;
  link: string | null;
  status: WishlistStatus;
  image_url: string | null;
  created_at: string;
};

export type WishlistInsert = {
  user_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  link?: string | null;
  status?: WishlistStatus;
  image_url?: string | null;
};
