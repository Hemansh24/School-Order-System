import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

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

export interface ListBooksellerDiscountsData {
  booksellers: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    booksellerName: string;
    address01?: string | null;
    incumbentCode?: string | null;
    sourceRow?: number | null;
    actualDiscount?: string | null;
  } & Bookseller_Key)[];
}

export interface ListBooksellerDiscountsVariables {
  limit?: number | null;
  offset?: number | null;
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
    actualDiscount?: string | null;
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

export interface ListSharedPreBooksellersData {
  sharedPreBooksellers: ({
    pbsCode: string;
    sourceBsCode?: string | null;
    vendorName: string;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    contactPerson?: string | null;
    email?: string | null;
    taxId?: string | null;
    schoolDealCount?: string | null;
    approximateStrength?: string | null;
    groupSchoolCount?: string | null;
    committedDiscount?: string | null;
    transportCollaboration?: string | null;
    bookingStation?: string | null;
    vendorType?: string | null;
    paymentStatus?: string | null;
    conversionStatus: string;
    assignedBsCode?: string | null;
    convertedAt?: TimestampString | null;
    syncedAt: TimestampString;
  } & SharedPreBookseller_Key)[];
}

export interface ListSharedPreBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedSchoolGroupLocationsData {
  sharedSchoolGroupLocations: ({
    id: Int64String;
    groupCode: string;
    subCode: string;
    name: string;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pincode?: string | null;
    centralizedDecision?: string | null;
    syncedAt: TimestampString;
  } & SharedSchoolGroupLocation_Key)[];
}

export interface ListSharedSchoolGroupLocationsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedSchoolGroupsData {
  sharedSchoolGroups: ({
    id: Int64String;
    groupCode: string;
    groupName: string;
    active: boolean;
    syncedAt: TimestampString;
  } & SharedSchoolGroup_Key)[];
}

export interface ListSharedSchoolGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedVendorSchoolsData {
  sharedVendorSchools: ({
    vendorCode: string;
    schoolCode: string;
    syncedAt: TimestampString;
  } & SharedVendorSchool_Key)[];
}

export interface ListSharedVendorSchoolsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedVendorsData {
  sharedVendors: ({
    vendorCode: string;
    preVendorCode?: string | null;
    booksellerCode?: string | null;
    vendorName: string;
    vendorType?: string | null;
    vendorRating?: string | null;
    actualDiscount?: string | null;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    taxId?: string | null;
    paymentStatus?: string | null;
    syncedAt: TimestampString;
  } & SharedVendor_Key)[];
}

export interface ListSharedVendorsVariables {
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

export interface SetBooksellerActualDiscountData {
  bookseller_updateMany: number;
}

export interface SetBooksellerActualDiscountVariables {
  id: Int64String;
  actualDiscount?: string | null;
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

export interface SharedPreBookseller_Key {
  pbsCode: string;
  __typename?: 'SharedPreBookseller_Key';
}

export interface SharedSchoolGroupLocation_Key {
  id: Int64String;
  __typename?: 'SharedSchoolGroupLocation_Key';
}

export interface SharedSchoolGroup_Key {
  id: Int64String;
  __typename?: 'SharedSchoolGroup_Key';
}

export interface SharedVendorSchool_Key {
  vendorCode: string;
  schoolCode: string;
  __typename?: 'SharedVendorSchool_Key';
}

export interface SharedVendor_Key {
  vendorCode: string;
  __typename?: 'SharedVendor_Key';
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

export interface UpsertPreBooksellerData {
  sharedPreBookseller_upsert: SharedPreBookseller_Key;
}

export interface UpsertPreBooksellerVariables {
  pbsCode: string;
  sourceBsCode?: string | null;
  vendorName: string;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  taxId?: string | null;
  schoolDealCount?: string | null;
  approximateStrength?: string | null;
  groupSchoolCount?: string | null;
  committedDiscount?: string | null;
  transportCollaboration?: string | null;
  bookingStation?: string | null;
  vendorType?: string | null;
  paymentStatus?: string | null;
  conversionStatus: string;
  assignedBsCode?: string | null;
  convertedAt?: TimestampString | null;
}

export interface UpsertSharedSchoolGroupData {
  sharedSchoolGroup_upsert: SharedSchoolGroup_Key;
}

export interface UpsertSharedSchoolGroupLocationData {
  sharedSchoolGroupLocation_upsert: SharedSchoolGroupLocation_Key;
}

export interface UpsertSharedSchoolGroupLocationVariables {
  id: Int64String;
  groupCode: string;
  subCode: string;
  name: string;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  centralizedDecision?: string | null;
}

export interface UpsertSharedSchoolGroupVariables {
  id: Int64String;
  groupCode: string;
  groupName: string;
  active: boolean;
}

export interface UpsertSharedVendorData {
  sharedVendor_upsert: SharedVendor_Key;
}

export interface UpsertSharedVendorSchoolData {
  sharedVendorSchool_upsert: SharedVendorSchool_Key;
}

export interface UpsertSharedVendorSchoolVariables {
  vendorCode: string;
  schoolCode: string;
}

export interface UpsertSharedVendorVariables {
  vendorCode: string;
  preVendorCode?: string | null;
  booksellerCode?: string | null;
  vendorName: string;
  vendorType?: string | null;
  vendorRating?: string | null;
  actualDiscount?: string | null;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  paymentStatus?: string | null;
}

interface SetBooksellerActualDiscountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetBooksellerActualDiscountVariables): MutationRef<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetBooksellerActualDiscountVariables): MutationRef<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;
  operationName: string;
}
export const setBooksellerActualDiscountRef: SetBooksellerActualDiscountRef;

export function setBooksellerActualDiscount(vars: SetBooksellerActualDiscountVariables): MutationPromise<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;
export function setBooksellerActualDiscount(dc: DataConnect, vars: SetBooksellerActualDiscountVariables): MutationPromise<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;

interface UpsertChristianGroupRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertChristianGroupVariables): MutationRef<UpsertChristianGroupData, UpsertChristianGroupVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertChristianGroupVariables): MutationRef<UpsertChristianGroupData, UpsertChristianGroupVariables>;
  operationName: string;
}
export const upsertChristianGroupRef: UpsertChristianGroupRef;

export function upsertChristianGroup(vars: UpsertChristianGroupVariables): MutationPromise<UpsertChristianGroupData, UpsertChristianGroupVariables>;
export function upsertChristianGroup(dc: DataConnect, vars: UpsertChristianGroupVariables): MutationPromise<UpsertChristianGroupData, UpsertChristianGroupVariables>;

interface SetChristianGroupActiveRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetChristianGroupActiveVariables): MutationRef<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetChristianGroupActiveVariables): MutationRef<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
  operationName: string;
}
export const setChristianGroupActiveRef: SetChristianGroupActiveRef;

export function setChristianGroupActive(vars: SetChristianGroupActiveVariables): MutationPromise<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
export function setChristianGroupActive(dc: DataConnect, vars: SetChristianGroupActiveVariables): MutationPromise<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;

interface UpsertPreBooksellerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPreBooksellerVariables): MutationRef<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertPreBooksellerVariables): MutationRef<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
  operationName: string;
}
export const upsertPreBooksellerRef: UpsertPreBooksellerRef;

export function upsertPreBookseller(vars: UpsertPreBooksellerVariables): MutationPromise<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
export function upsertPreBookseller(dc: DataConnect, vars: UpsertPreBooksellerVariables): MutationPromise<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;

interface UpsertSharedSchoolGroupRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedSchoolGroupVariables): MutationRef<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSharedSchoolGroupVariables): MutationRef<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;
  operationName: string;
}
export const upsertSharedSchoolGroupRef: UpsertSharedSchoolGroupRef;

export function upsertSharedSchoolGroup(vars: UpsertSharedSchoolGroupVariables): MutationPromise<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;
export function upsertSharedSchoolGroup(dc: DataConnect, vars: UpsertSharedSchoolGroupVariables): MutationPromise<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;

interface UpsertSharedSchoolGroupLocationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedSchoolGroupLocationVariables): MutationRef<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSharedSchoolGroupLocationVariables): MutationRef<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;
  operationName: string;
}
export const upsertSharedSchoolGroupLocationRef: UpsertSharedSchoolGroupLocationRef;

export function upsertSharedSchoolGroupLocation(vars: UpsertSharedSchoolGroupLocationVariables): MutationPromise<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;
export function upsertSharedSchoolGroupLocation(dc: DataConnect, vars: UpsertSharedSchoolGroupLocationVariables): MutationPromise<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;

interface UpsertSharedVendorRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedVendorVariables): MutationRef<UpsertSharedVendorData, UpsertSharedVendorVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSharedVendorVariables): MutationRef<UpsertSharedVendorData, UpsertSharedVendorVariables>;
  operationName: string;
}
export const upsertSharedVendorRef: UpsertSharedVendorRef;

export function upsertSharedVendor(vars: UpsertSharedVendorVariables): MutationPromise<UpsertSharedVendorData, UpsertSharedVendorVariables>;
export function upsertSharedVendor(dc: DataConnect, vars: UpsertSharedVendorVariables): MutationPromise<UpsertSharedVendorData, UpsertSharedVendorVariables>;

interface UpsertSharedVendorSchoolRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedVendorSchoolVariables): MutationRef<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSharedVendorSchoolVariables): MutationRef<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;
  operationName: string;
}
export const upsertSharedVendorSchoolRef: UpsertSharedVendorSchoolRef;

export function upsertSharedVendorSchool(vars: UpsertSharedVendorSchoolVariables): MutationPromise<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;
export function upsertSharedVendorSchool(dc: DataConnect, vars: UpsertSharedVendorSchoolVariables): MutationPromise<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;

interface ListOrganisationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListOrganisationsVariables): QueryRef<ListOrganisationsData, ListOrganisationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListOrganisationsVariables): QueryRef<ListOrganisationsData, ListOrganisationsVariables>;
  operationName: string;
}
export const listOrganisationsRef: ListOrganisationsRef;

export function listOrganisations(vars?: ListOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, ListOrganisationsVariables>;
export function listOrganisations(dc: DataConnect, vars?: ListOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, ListOrganisationsVariables>;

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

interface ListBooksellerDiscountsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListBooksellerDiscountsVariables): QueryRef<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListBooksellerDiscountsVariables): QueryRef<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;
  operationName: string;
}
export const listBooksellerDiscountsRef: ListBooksellerDiscountsRef;

export function listBooksellerDiscounts(vars?: ListBooksellerDiscountsVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;
export function listBooksellerDiscounts(dc: DataConnect, vars?: ListBooksellerDiscountsVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;

interface ListBooksellersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListBooksellersVariables): QueryRef<ListBooksellersData, ListBooksellersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListBooksellersVariables): QueryRef<ListBooksellersData, ListBooksellersVariables>;
  operationName: string;
}
export const listBooksellersRef: ListBooksellersRef;

export function listBooksellers(vars?: ListBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, ListBooksellersVariables>;
export function listBooksellers(dc: DataConnect, vars?: ListBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, ListBooksellersVariables>;

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
  (vars?: ListItemsVariables): QueryRef<ListItemsData, ListItemsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListItemsVariables): QueryRef<ListItemsData, ListItemsVariables>;
  operationName: string;
}
export const listItemsRef: ListItemsRef;

export function listItems(vars?: ListItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, ListItemsVariables>;
export function listItems(dc: DataConnect, vars?: ListItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, ListItemsVariables>;

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
  (vars?: ListBooksellerSchoolMappingVariables): QueryRef<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables): QueryRef<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
  operationName: string;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;

export function listBooksellerSchoolMapping(vars?: ListBooksellerSchoolMappingVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
export function listBooksellerSchoolMapping(dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;

interface ListSharedSchoolGroupsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedSchoolGroupsVariables): QueryRef<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedSchoolGroupsVariables): QueryRef<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
  operationName: string;
}
export const listSharedSchoolGroupsRef: ListSharedSchoolGroupsRef;

export function listSharedSchoolGroups(vars?: ListSharedSchoolGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
export function listSharedSchoolGroups(dc: DataConnect, vars?: ListSharedSchoolGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;

interface ListSharedSchoolGroupLocationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedSchoolGroupLocationsVariables): QueryRef<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables): QueryRef<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
  operationName: string;
}
export const listSharedSchoolGroupLocationsRef: ListSharedSchoolGroupLocationsRef;

export function listSharedSchoolGroupLocations(vars?: ListSharedSchoolGroupLocationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
export function listSharedSchoolGroupLocations(dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;

interface ListSharedChristianGroupsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedChristianGroupsVariables): QueryRef<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedChristianGroupsVariables): QueryRef<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
  operationName: string;
}
export const listSharedChristianGroupsRef: ListSharedChristianGroupsRef;

export function listSharedChristianGroups(vars?: ListSharedChristianGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
export function listSharedChristianGroups(dc: DataConnect, vars?: ListSharedChristianGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;

interface ListSharedPreBooksellersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedPreBooksellersVariables): QueryRef<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedPreBooksellersVariables): QueryRef<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
  operationName: string;
}
export const listSharedPreBooksellersRef: ListSharedPreBooksellersRef;

export function listSharedPreBooksellers(vars?: ListSharedPreBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
export function listSharedPreBooksellers(dc: DataConnect, vars?: ListSharedPreBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;

interface ListSharedVendorsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedVendorsVariables): QueryRef<ListSharedVendorsData, ListSharedVendorsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedVendorsVariables): QueryRef<ListSharedVendorsData, ListSharedVendorsVariables>;
  operationName: string;
}
export const listSharedVendorsRef: ListSharedVendorsRef;

export function listSharedVendors(vars?: ListSharedVendorsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorsData, ListSharedVendorsVariables>;
export function listSharedVendors(dc: DataConnect, vars?: ListSharedVendorsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorsData, ListSharedVendorsVariables>;

interface ListSharedVendorSchoolsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedVendorSchoolsVariables): QueryRef<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListSharedVendorSchoolsVariables): QueryRef<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;
  operationName: string;
}
export const listSharedVendorSchoolsRef: ListSharedVendorSchoolsRef;

export function listSharedVendorSchools(vars?: ListSharedVendorSchoolsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;
export function listSharedVendorSchools(dc: DataConnect, vars?: ListSharedVendorSchoolsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;

