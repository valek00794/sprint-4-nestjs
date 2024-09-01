export type SortDirection = 'ASC' | 'DESC';
export const PublishedStatuses = ['all', 'published', 'notPublished'];

export type SearchQueryParametersType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  searchNameTerm?: string | null;
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
  bodySearchTerm?: string | null;
  publishedStatus?: string;
  sort?: string[];
};
