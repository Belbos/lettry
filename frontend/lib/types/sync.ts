export type SyncResponse = {
  inserted: number;
  fetched: number;
  started_from: number;
  stopped_at: number;
  new_draw_nos: number[];
  note: string;
  total: number;
};
