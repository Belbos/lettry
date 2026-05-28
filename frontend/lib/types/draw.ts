export type Draw = {
  draw_no: number;
  draw_date: string;
  numbers: number[];
  bonus_number: number;
};

export type DrawListResponse = {
  items: Draw[];
  total: number;
  limit: number;
  offset: number;
};
