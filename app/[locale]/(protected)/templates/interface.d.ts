// Master HTML template (managed under /templates and edited in the Nokonvo editor)
export interface MasterTemplate {
  _id: string;
  name: string;
  slug: string;
  description: string;
  fileName: string;
  filePath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Only present when fetched with ?includeHtml=true */
  html?: string | null;
}

export interface MasterTemplatesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: MasterTemplate[];
}

export interface MasterTemplateResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: MasterTemplate;
}
