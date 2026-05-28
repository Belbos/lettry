export type AdminUser = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export type DrawInput = {
  draw_no: number;
  draw_date: string;
  numbers: number[];
  bonus_number: number;
};

export type DrawResult = {
  draw_no: number;
  draw_date: string;
  numbers: number[];
  bonus_number: number;
};

export type ImportResult = {
  inserted: number;
  total: number;
};
