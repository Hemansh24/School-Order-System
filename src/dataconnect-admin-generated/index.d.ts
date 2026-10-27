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

export interface ListSharedExecutivesData {
  sharedExecutives: ({
    incumbentCode: string;
    name: string;
    mobile?: string | null;
    email?: string | null;
    baseLocation?: string | null;
    syncedAt: TimestampString;
  } & SharedExecutive_Key)[];
}

export interface ListSharedExecutivesVariables {
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

export interface ListSharedPtCodeUsageHistoryData {
  sharedPtCodeUsageHistories: ({
    ptCode: string;
    sessionYear: string;
    syncedAt: TimestampString;
  } & SharedPtCodeUsageHistory_Key)[];
}

export interface ListSharedPtCodeUsageHistoryVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListSharedSchoolExecutiveDefaultsData {
  sharedSchoolExecutiveDefaults: ({
    prCode: string;
    incumbentCode?: string | null;
    name: string;
    updatedAt: TimestampString;
  } & SharedSchoolExecutiveDefault_Key)[];
}

export interface ListSharedSchoolExecutiveDefaultsVariables {
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

export interface SharedExecutive_Key {
  incumbentCode: string;
  __typename?: 'SharedExecutive_Key';
}

export interface SharedOrderSchoolExecutive_Key {
  orderSheet1Id: number;
  schoolCode: string;
  __typename?: 'SharedOrderSchoolExecutive_Key';
}

export interface SharedPreBookseller_Key {
  pbsCode: string;
  __typename?: 'SharedPreBookseller_Key';
}

export interface SharedPtCodeUsageHistory_Key {
  ptCode: string;
  sessionYear: string;
  __typename?: 'SharedPtCodeUsageHistory_Key';
}

export interface SharedSchoolExecutiveDefault_Key {
  prCode: string;
  __typename?: 'SharedSchoolExecutiveDefault_Key';
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

export interface UpsertSharedExecutiveData {
  sharedExecutive_upsert: SharedExecutive_Key;
}

export interface UpsertSharedExecutiveVariables {
  incumbentCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
  baseLocation?: string | null;
}

export interface UpsertSharedOrderSchoolExecutiveData {
  sharedOrderSchoolExecutive_upsert: SharedOrderSchoolExecutive_Key;
}

export interface UpsertSharedOrderSchoolExecutiveVariables {
  orderSheet1Id: number;
  schoolCode: string;
  incumbentCode?: string | null;
  name: string;
}

export interface UpsertSharedPtCodeUsageHistoryData {
  sharedPtCodeUsageHistory_upsert: SharedPtCodeUsageHistory_Key;
}

export interface UpsertSharedPtCodeUsageHistoryVariables {
  ptCode: string;
  sessionYear: string;
}

export interface UpsertSharedSchoolExecutiveDefaultData {
  sharedSchoolExecutiveDefault_upsert: SharedSchoolExecutiveDefault_Key;
}

export interface UpsertSharedSchoolExecutiveDefaultVariables {
  prCode: string;
  incumbentCode?: string | null;
  name: string;
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

/** Generated Node Admin SDK operation action function for the 'SetBooksellerActualDiscount' Mutation. Allow users to execute without passing in DataConnect. */
export function setBooksellerActualDiscount(dc: DataConnect, vars: SetBooksellerActualDiscountVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetBooksellerActualDiscountData>>;
/** Generated Node Admin SDK operation action function for the 'SetBooksellerActualDiscount' Mutation. Allow users to pass in custom DataConnect instances. */
export function setBooksellerActualDiscount(vars: SetBooksellerActualDiscountVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetBooksellerActualDiscountData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertChristianGroup' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertChristianGroup(dc: DataConnect, vars: UpsertChristianGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertChristianGroupData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertChristianGroup' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertChristianGroup(vars: UpsertChristianGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertChristianGroupData>>;

/** Generated Node Admin SDK operation action function for the 'SetChristianGroupActive' Mutation. Allow users to execute without passing in DataConnect. */
export function setChristianGroupActive(dc: DataConnect, vars: SetChristianGroupActiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetChristianGroupActiveData>>;
/** Generated Node Admin SDK operation action function for the 'SetChristianGroupActive' Mutation. Allow users to pass in custom DataConnect instances. */
export function setChristianGroupActive(vars: SetChristianGroupActiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetChristianGroupActiveData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertPreBookseller' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertPreBookseller(dc: DataConnect, vars: UpsertPreBooksellerVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPreBooksellerData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertPreBookseller' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertPreBookseller(vars: UpsertPreBooksellerVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPreBooksellerData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolGroup' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedSchoolGroup(dc: DataConnect, vars: UpsertSharedSchoolGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolGroupData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolGroup' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedSchoolGroup(vars: UpsertSharedSchoolGroupVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolGroupData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolGroupLocation' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedSchoolGroupLocation(dc: DataConnect, vars: UpsertSharedSchoolGroupLocationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolGroupLocationData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolGroupLocation' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedSchoolGroupLocation(vars: UpsertSharedSchoolGroupLocationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolGroupLocationData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedVendor' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedVendor(dc: DataConnect, vars: UpsertSharedVendorVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedVendorData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedVendor' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedVendor(vars: UpsertSharedVendorVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedVendorData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedVendorSchool' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedVendorSchool(dc: DataConnect, vars: UpsertSharedVendorSchoolVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedVendorSchoolData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedVendorSchool' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedVendorSchool(vars: UpsertSharedVendorSchoolVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedVendorSchoolData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedPtCodeUsageHistory' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedPtCodeUsageHistory(dc: DataConnect, vars: UpsertSharedPtCodeUsageHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedPtCodeUsageHistoryData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedPtCodeUsageHistory' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedPtCodeUsageHistory(vars: UpsertSharedPtCodeUsageHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedPtCodeUsageHistoryData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedExecutive' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedExecutive(dc: DataConnect, vars: UpsertSharedExecutiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedExecutiveData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedExecutive' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedExecutive(vars: UpsertSharedExecutiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedExecutiveData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolExecutiveDefault' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedSchoolExecutiveDefault(dc: DataConnect, vars: UpsertSharedSchoolExecutiveDefaultVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolExecutiveDefaultData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedSchoolExecutiveDefault' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedSchoolExecutiveDefault(vars: UpsertSharedSchoolExecutiveDefaultVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedSchoolExecutiveDefaultData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertSharedOrderSchoolExecutive' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertSharedOrderSchoolExecutive(dc: DataConnect, vars: UpsertSharedOrderSchoolExecutiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedOrderSchoolExecutiveData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertSharedOrderSchoolExecutive' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertSharedOrderSchoolExecutive(vars: UpsertSharedOrderSchoolExecutiveVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertSharedOrderSchoolExecutiveData>>;

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

/** Generated Node Admin SDK operation action function for the 'ListBooksellerDiscounts' Query. Allow users to execute without passing in DataConnect. */
export function listBooksellerDiscounts(dc: DataConnect, vars?: ListBooksellerDiscountsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellerDiscountsData>>;
/** Generated Node Admin SDK operation action function for the 'ListBooksellerDiscounts' Query. Allow users to pass in custom DataConnect instances. */
export function listBooksellerDiscounts(vars?: ListBooksellerDiscountsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBooksellerDiscountsData>>;

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

/** Generated Node Admin SDK operation action function for the 'ListSharedPreBooksellers' Query. Allow users to execute without passing in DataConnect. */
export function listSharedPreBooksellers(dc: DataConnect, vars?: ListSharedPreBooksellersVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedPreBooksellersData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedPreBooksellers' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedPreBooksellers(vars?: ListSharedPreBooksellersVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedPreBooksellersData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedVendors' Query. Allow users to execute without passing in DataConnect. */
export function listSharedVendors(dc: DataConnect, vars?: ListSharedVendorsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedVendorsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedVendors' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedVendors(vars?: ListSharedVendorsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedVendorsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedVendorSchools' Query. Allow users to execute without passing in DataConnect. */
export function listSharedVendorSchools(dc: DataConnect, vars?: ListSharedVendorSchoolsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedVendorSchoolsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedVendorSchools' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedVendorSchools(vars?: ListSharedVendorSchoolsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedVendorSchoolsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedPtCodeUsageHistory' Query. Allow users to execute without passing in DataConnect. */
export function listSharedPtCodeUsageHistory(dc: DataConnect, vars?: ListSharedPtCodeUsageHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedPtCodeUsageHistoryData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedPtCodeUsageHistory' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedPtCodeUsageHistory(vars?: ListSharedPtCodeUsageHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedPtCodeUsageHistoryData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedExecutives' Query. Allow users to execute without passing in DataConnect. */
export function listSharedExecutives(dc: DataConnect, vars?: ListSharedExecutivesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedExecutivesData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedExecutives' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedExecutives(vars?: ListSharedExecutivesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedExecutivesData>>;

/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolExecutiveDefaults' Query. Allow users to execute without passing in DataConnect. */
export function listSharedSchoolExecutiveDefaults(dc: DataConnect, vars?: ListSharedSchoolExecutiveDefaultsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolExecutiveDefaultsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSharedSchoolExecutiveDefaults' Query. Allow users to pass in custom DataConnect instances. */
export function listSharedSchoolExecutiveDefaults(vars?: ListSharedSchoolExecutiveDefaultsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSharedSchoolExecutiveDefaultsData>>;

