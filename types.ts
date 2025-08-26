export type Order = {
  id: string;
  order_no: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  instagram_url: string | null;
  product_name: string | null;
  comment: string | null;
  amount_purchase: number | null;
  amount_sale: number | null;
  amount_deposit: number | null;
  created_at: string;
  user_id: string;
}
