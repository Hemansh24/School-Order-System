import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

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

export interface ListBooksellerSchoolMappingVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListBooksellersData {
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

export interface ListBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListItemsData {
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

export interface ListItemsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListOrganisationsData {
  organisations: ({
    id: Int64String;
    groupCode?: string | null;
    ptCode?: string | null;
    prCode: string;
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

export interface ListOrganisationsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedChristianGroupsData {
  sharedChristianGroups: ({
    groupCode: string;
    organisationName: string;
    religionDenomination?: string | null;
    category?: string | null;
    geographyType?: string | null;
    operationalAreas?: string | null;
    locationDistrict?: string | null;
    locationState?: string | null;
    pinCode?: string | null;
    address?: string | null;
    phoneEmail?: string | null;
    runsSchools?: string | null;
    totalSchools?: string | null;
    totalStudents?: string | null;
    centralizedDecision?: string | null;
    website?: string | null;
    active: boolean;
    sourceSheetRow?: number | null;
    sourceHash?: string | null;
    syncedAt: TimestampString;
  } & SharedChristianGroup_Key)[];
}

export interface ListSharedChristianGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedSchoolGroupLocationsData {
  sharedSchoolGroupLocations: ({
    groupCode: string;
    subCode: string;
    name: string;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pincode?: string | null;
    centralizedDecision?: string | null;
    syncedAt: TimestampString;
  })[];
}

export interface ListSharedSchoolGroupLocationsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedSchoolGroupsData {
  sharedSchoolGroups: ({
    groupCode: string;
    groupName: string;
    syncedAt: TimestampString;
  })[];
}

export interface ListSharedSchoolGroupsVariables {
  limit?: number | null;
  offset?: number | null;
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

export interface SetChristianGroupActiveData {
  sharedChristianGroup_update?: SharedChristianGroup_Key | null;
}

export interface SetChristianGroupActiveVariables {
  groupCode: string;
  active: boolean;
}

export interface SharedChristianGroup_Key {
  groupCode: string;
  __typename?: 'SharedChristianGroup_Key';
}

export interface SharedSchoolGroupLocation_Key {
  id: Int64String;
  __typename?: 'SharedSchoolGroupLocation_Key';
}

export interface SharedSchoolGroup_Key {
  id: Int64String;
  __typename?: 'SharedSchoolGroup_Key';
}

export interface UpsertChristianGroupData {
  sharedChristianGroup_upsert: SharedChristianGroup_Key;
}

export interface UpsertChristianGroupVariables {
  groupCode: string;
  organisationName: string;
  religionDenomination?: string | null;
  category?: string | null;
  geographyType?: string | null;
  operationalAreas?: string | null;
  locationDistrict?: string | null;
  locationState?: string | null;
  pinCode?: string | null;
  address?: string | null;
  phoneEmail?: string | null;
  runsSchools?: string | null;
  totalSchools?: string | null;
  totalStudents?: string | null;
  centralizedDecision?: string | null;
  website?: string | null;
  active: boolean;
  sourceSheetRow?: number | null;
  sourceHash?: string | null;
}

/** Generated Node Admin SDK operation action function for the 'UpsertChristianGroup' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertChristianGroup(dc: DataConnect, vars: UpsertChristianGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertChristianGroupData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertChristianGroup' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertChristianGroup(vars: UpsertChristianGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertChristianGroupData>>;

/** Generated Node Admin SDK operation action function for the 'SetChristianGroupActive' Mutation. Allow users to execute without passing in DataConnect. */
export function setChristianGroupActive(dc: DataConnect, vars: SetChristianGroupActiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetChristianGroupActiveData>>;
/** Generated Node Admin SDK operation action function for the 'SetChristianGroupActive' Mutation. Allow users to pass in custom DataConnect instances. */
export function setChristianGroupActive(vars: SetChristianGroupActiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetChristianGroupActiveData>>;

/** Generated Node Admin SDK operation action function for the 'ListOrganisations' Query. Allow users to execute without passing in DataConnect. */
export function listOrganisations(dc: DataConnect, vars?: ListOrganisationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListOrganisationsData>>;
/** Generated Node Admin SDK operation action function for the 'ListOrganisations' Query. Allow users to pass in custom DataConnect instances. */
export function listOrganisations(vars?: ListOrganisationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListOrganisationsData>>;

/** Generated Node Admin SDK operation action function for the 'SearchOrganisations' Query. Allow users to execute without passing in DataConnect. */
export function searchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SearchOrganisationsData>>;
/** Generated Node Admin SDK operation action function for the 'SearchOrganisations' Query. Allow users to pass in custom DataConnect instances. */
export function searchOrganisations(vars?: SearchOrganisationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SearchOrganisationsData>>;

/** Generated Node Admin SDK operation action function for the 'GetOrganisationByPrCode' Query. Allow users to execute without passing in DataConnect. */
export function getOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetOrganisationByPrCodeData>>;
/** Generated Node Admin SDK operation action function for the 'GetOrganisationByPrCode' Query. Allow users to pass in custom DataConnect instances. */
export function getOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetOrganisationByPrCodeData>>;

/** Generated Node Admin SDK operation action function for the 'ListBooksellers' Query. Allow users to execute without passing in DataConnect. */
export function listBooksellers(dc: DataConnect, vars?: ListBooksellersVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellersData>>;
/** Generated Node Admin SDK operation action function for the 'ListBooksellers' Query. Allow users to pass in custom DataConnect instances. */
export function listBooksellers(vars?: ListBooksellersVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellersData>>;

/** Generated Node Admin SDK operation action function for the 'GetBooksellerByCode' Query. Allow users to execute without passing in DataConnect. */
export function getBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetBooksellerByCodeData>>;
/** Generated Node Admin SDK operation action function for the 'GetBooksellerByCode' Query. Allow users to pass in custom DataConnect instances. */
export function getBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetBooksellerByCodeData>>;

/** Generated Node Admin SDK operation action function for the 'ListItems' Query. Allow users to execute without passing in DataConnect. */
export function listItems(dc: DataConnect, vars?: ListItemsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListItemsData>>;
/** Generated Node Admin SDK operation action function for the 'ListItems' Query. Allow users to pass in custom DataConnect instances. */
export function listItems(vars?: ListItemsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListItemsData>>;

/** Generated Node Admin SDK operation action function for the 'GetItemByCode' Query. Allow users to execute without passing in DataConnect. */
export function getItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetItemByCodeData>>;
/** Generated Node Admin SDK operation action function for the 'GetItemByCode' Query. Allow users to pass in custom DataConnect instances. */
export function getItemByCode(vars: GetItemByCodeVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetItemByCodeData>>;

/** Generated Node Admin SDK operation action function for the 'ListBooksellerSchoolMapping' Query. Allow users to execute without passing in DataConnect. */
export function listBooksellerSchoolMapping(dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellerSchoolMappingData>>;
/** Generated Node Admin SDK operation action function for the 'ListBooksellerSchoolMapping' Query. Allow users to pass in custom DataConnect instances. */
export function listBooksellerSchoolMapping(vars?: ListBooksellerSchoolMappingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellerSchoolMappingData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolGroups' Query. Allow users to execute without passing in DataConnect. */
export function listSharedSchoolGroups(dc: DataConnect, vars?: ListSharedSchoolGroupsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolGroupsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolGroups' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedSchoolGroups(vars?: ListSharedSchoolGroupsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolGroupsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolGroupLocations' Query. Allow users to execute without passing in DataConnect. */
export function listSharedSchoolGroupLocations(dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolGroupLocationsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolGroupLocations' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedSchoolGroupLocations(vars?: ListSharedSchoolGroupLocationsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolGroupLocationsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedChristianGroups' Query. Allow users to execute without passing in DataConnect. */
export function listSharedChristianGroups(dc: DataConnect, vars?: ListSharedChristianGroupsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedChristianGroupsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedChristianGroups' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedChristianGroups(vars?: ListSharedChristianGroupsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedChristianGroupsData>>;

