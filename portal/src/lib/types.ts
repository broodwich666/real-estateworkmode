export type Project = {
  id: number;
  name: string;
  description: string;
  fields: string[];
  created_at: string;
  record_count: number;
};

export type RecordRow = {
  id: number;
  project_id: number;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type SearchHit = RecordRow & {
  project_name: string;
};
