import { ListOrganisationsData, SearchOrganisationsData, SearchOrganisationsVariables, GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables, ListBooksellersData, GetBooksellerByCodeData, GetBooksellerByCodeVariables, ListItemsData, GetItemByCodeData, GetItemByCodeVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListOrganisations(options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, undefined>;
export function useListOrganisations(dc: DataConnect, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, undefined>;

export function useSearchOrganisations(vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;
export function useSearchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;

export function useGetOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
export function useGetOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;

export function useListBooksellers(options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, undefined>;
export function useListBooksellers(dc: DataConnect, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, undefined>;

export function useGetBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
export function useGetBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;

export function useListItems(options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, undefined>;
export function useListItems(dc: DataConnect, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, undefined>;

export function useGetItemByCode(vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;
export function useGetItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;
