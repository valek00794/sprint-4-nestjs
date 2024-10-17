import {
  BannedStatuses,
  PublishedStatuses,
  SearchQueryParametersType,
  SortDirection,
} from './domain/query.types';

const defaultSearchQueryParameters = {
  pageNumber: 1,
  pageSize: 10,
  maxPageSize: 100,
  sortBy: 'createdAt',
  sortDirection: 'DESC' as SortDirection,
  searchLoginTerm: null,
  searchEmailTerm: null,
  searchNameTerm: null,
  bodySearchTerm: null,
  publishedStatus: 'all',
  banStatus: 'all',
  sort: ['avgScores desc', 'sumScore desc'],
};

export const getSanitizationQuery = (
  query?: SearchQueryParametersType,
): SearchQueryParametersType => {
  return {
    pageNumber: !isNaN(query!.pageNumber!)
      ? +query!.pageNumber
      : defaultSearchQueryParameters.pageNumber,
    pageSize:
      !isNaN(query!.pageSize!) || query!.pageSize! <= defaultSearchQueryParameters.maxPageSize
        ? +query!.pageSize
        : defaultSearchQueryParameters.pageSize,
    sortBy: query?.sortBy ? query.sortBy : defaultSearchQueryParameters.sortBy,
    sortDirection:
      query?.sortDirection && query.sortDirection.toUpperCase() === 'ASC'
        ? 'ASC'
        : defaultSearchQueryParameters.sortDirection,
    searchLoginTerm: query?.searchLoginTerm
      ? query.searchLoginTerm
      : defaultSearchQueryParameters.searchLoginTerm,
    searchEmailTerm: query?.searchEmailTerm
      ? query.searchEmailTerm
      : defaultSearchQueryParameters.searchEmailTerm,
    searchNameTerm: query?.searchNameTerm
      ? query.searchNameTerm
      : defaultSearchQueryParameters.searchNameTerm,
    publishedStatus:
      query?.publishedStatus && PublishedStatuses.includes(query.publishedStatus)
        ? query.publishedStatus
        : defaultSearchQueryParameters.publishedStatus,
    banStatus:
      query?.banStatus && BannedStatuses.includes(query.banStatus)
        ? query.banStatus
        : defaultSearchQueryParameters.banStatus,
    bodySearchTerm: query?.bodySearchTerm
      ? query.bodySearchTerm
      : defaultSearchQueryParameters.bodySearchTerm,
    sort: query?.sort
      ? Array.isArray(query.sort)
        ? query.sort
        : [query.sort]
      : defaultSearchQueryParameters.sort,
  };
};

export const roundScore = (score: number): number => {
  const rounded = Math.round(score * 100) / 100;
  return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
};
