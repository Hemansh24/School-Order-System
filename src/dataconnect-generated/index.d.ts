import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface BooksellerSchoolMapping_Key {
  id: Int64String;
  __typename?: 'BooksellerSchoolMapping_Key';
}

export interface Bookseller_Key {
  id: Int64String;
  __typename?: 'Bookseller_Key';
}

export interface GetBooksellerByCodeData {
  booksellers: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    booksellerName: string;
    academicYear?: string | null;
    address01?: string | null;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    gstPin?: string | null;
    incumbentCode?: string | null;
    incumbentName?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    vendorType?: string | null;
    remark?: string | null;
  } & Bookseller_Key)[];
}

export interface GetBooksellerByCodeVariables {
  booksellerCode: string;
}

export interface GetItemByCodeData {
  items: ({
    id: Int64String;
    itemCode: string;
    title: string;
    categoryType?: string | null;
    categoryCode?: string | null;
    subCategoryCode?: string | null;
    languageCode?: string | null;
    customisationType?: string | null;
    customisationCode?: string | null;
    editionCode?: string | null;
    mrp?: number | null;
    isbnNo?: string | null;
    obsolete?: boolean | null;
  } & Item_Key)[];
}

export interface GetItemByCodeVariables {
  itemCode: string;
}

export interface GetOrganisationByPrCodeData {
  organisations: ({
    id: Int64String;
    prCode: string;
    groupCode?: string | null;
    ptCode?: string | null;
    organisationName: string;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    actionStatus?: string | null;
    remark?: string | null;
    academicYear?: string | null;
    strength?: number | null;
    boardType?: string | null;
    sessionStartFrom?: DateString | null;
    minorityType?: string | null;
    saturdayStatus?: string | null;
    workingStatus?: boolean | null;
  } & Organisation_Key)[];
}

export interface GetOrganisationByPrCodeVariables {
  prCode: string;
}

export interface Item_Key {
  id: Int64String;
  __typename?: 'Item_Key';
}

export interface ListBooksellerSchoolMappingData {
  booksellerSchoolMappings: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    ptCode: string;
  } & BooksellerSchoolMapping_Key)[];
}

export interface ListBooksellersData {
  booksellers: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    booksellerName: string;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    vendorType?: string | null;
  } & Bookseller_Key)[];
}

export interface ListItemsData {
  items: ({
    id: Int64String;
    itemCode: string;
    title: string;
    categoryType?: string | null;
    languageCode?: string | null;
    mrp?: number | null;
    isbnNo?: string | null;
    obsolete?: boolean | null;
  } & Item_Key)[];
}

export interface ListOrganisationsData {
  organisations: ({
    id: Int64String;
    prCode: string;
    organisationName: string;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    actionStatus?: string | null;
    workingStatus?: boolean | null;
  } & Organisation_Key)[];
}

export interface Organisation_Key {
  id: Int64String;
  __typename?: 'Organisation_Key';
}

export interface SearchOrganisationsData {
  organisations: ({
    id: Int64String;
    prCode: string;
    organisationName: string;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    actionStatus?: string | null;
    workingStatus?: boolean | null;
  } & Organisation_Key)[];
}

export interface SearchOrganisationsVariables {
  prCode?: string | null;
  organisationName?: string | null;
  district?: string | null;
  state?: string | null;
  actionStatus?: string | null;
  workingStatus?: boolean | null;
  limit?: number | null;
  offset?: number | null;
}

interface ListOrganisationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganisationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOrganisationsData, undefined>;
  operationName: string;
}
export const listOrganisationsRef: ListOrganisationsRef;

export function listOrganisations(options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, undefined>;
export function listOrganisations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, undefined>;

interface SearchOrganisationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchOrganisationsVariables): QueryRef<SearchOrganisationsData, SearchOrganisationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchOrganisationsVariables): QueryRef<SearchOrganisationsData, SearchOrganisationsVariables>;
  operationName: string;
}
export const searchOrganisationsRef: SearchOrganisationsRef;

export function searchOrganisations(vars?: SearchOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchOrganisationsData, SearchOrganisationsVariables>;
export function searchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchOrganisationsData, SearchOrganisationsVariables>;

interface GetOrganisationByPrCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrganisationByPrCodeVariables): QueryRef<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOrganisationByPrCodeVariables): QueryRef<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
  operationName: string;
}
export const getOrganisationByPrCodeRef: GetOrganisationByPrCodeRef;

export function getOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
export function getOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;

interface ListBooksellersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksellersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBooksellersData, undefined>;
  operationName: string;
}
export const listBooksellersRef: ListBooksellersRef;

export function listBooksellers(options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, undefined>;
export function listBooksellers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, undefined>;

interface GetBooksellerByCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBooksellerByCodeVariables): QueryRef<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBooksellerByCodeVariables): QueryRef<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
  operationName: string;
}
export const getBooksellerByCodeRef: GetBooksellerByCodeRef;

export function getBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
export function getBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;

interface ListItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListItemsData, undefined>;
  operationName: string;
}
export const listItemsRef: ListItemsRef;

export function listItems(options?: ExecuteQueryOptions): QueryPromise<ListItemsData, undefined>;
export function listItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, undefined>;

interface GetItemByCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemByCodeVariables): QueryRef<GetItemByCodeData, GetItemByCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetItemByCodeVariables): QueryRef<GetItemByCodeData, GetItemByCodeVariables>;
  operationName: string;
}
export const getItemByCodeRef: GetItemByCodeRef;

export function getItemByCode(vars: GetItemByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemByCodeData, GetItemByCodeVariables>;
export function getItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemByCodeData, GetItemByCodeVariables>;

interface ListBooksellerSchoolMappingRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksellerSchoolMappingData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBooksellerSchoolMappingData, undefined>;
  operationName: string;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;

export function listBooksellerSchoolMapping(options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, undefined>;
export function listBooksellerSchoolMapping(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, undefined>;

