import { SortDirection } from 'mongodb';
import { SearchQueryParametersType } from './domain/query.types';

const defaultSearchQueryParameters = {
  pageNumber: 1,
  pageSize: 10,
  maxPageSize: 100,
  sortBy: 'createdAt',
  sortDirection: 'desc' as SortDirection,
  searchLoginTerm: null,
  searchEmailTerm: null,
  searchNameTerm: null,
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
    sortDirection: query?.sortDirection
      ? query.sortDirection
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
  };
};
