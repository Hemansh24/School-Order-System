import { ListOrganisationsData, ListOrganisationsVariables, SearchOrganisationsData, SearchOrganisationsVariables, GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables, ListBooksellersData, ListBooksellersVariables, GetBooksellerByCodeData, GetBooksellerByCodeVariables, ListItemsData, ListItemsVariables, GetItemByCodeData, GetItemByCodeVariables, ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListOrganisations(vars?: ListOrganisationsVariables, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, ListOrganisationsVariables>;
export function useListOrganisations(dc: DataConnect, vars?: ListOrganisationsVariables, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, ListOrganisationsVariables>;

export function useSearchOrganisations(vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;
export function useSearchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;

export function useGetOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
export function useGetOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;

export function useListBooksellers(vars?: ListBooksellersVariables, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, ListBooksellersVariables>;
export function useListBooksellers(dc: DataConnect, vars?: ListBooksellersVariables, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, ListBooksellersVariables>;

export function useGetBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
export function useGetBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;

export function useListItems(vars?: ListItemsVariables, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, ListItemsVariables>;
export function useListItems(dc: DataConnect, vars?: ListItemsVariables, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, ListItemsVariables>;

export function useGetItemByCode(vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;
export function useGetItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;

export function useListBooksellerSchoolMapping(vars?: ListBooksellerSchoolMappingVariables, options?: useDataConnectQueryOptions<ListBooksellerSchoolMappingData>): UseDataConnectQueryResult<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
export function useListBooksellerSchoolMapping(dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables, options?: useDataConnectQueryOptions<ListBooksellerSchoolMappingData>): UseDataConnectQueryResult<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
