const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'system-order-34c0a-service',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const setBooksellerActualDiscountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetBooksellerActualDiscount', inputVars);
}
setBooksellerActualDiscountRef.operationName = 'SetBooksellerActualDiscount';
exports.setBooksellerActualDiscountRef = setBooksellerActualDiscountRef;

exports.setBooksellerActualDiscount = function setBooksellerActualDiscount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setBooksellerActualDiscountRef(dcInstance, inputVars));
}
;

const upsertChristianGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertChristianGroup', inputVars);
}
upsertChristianGroupRef.operationName = 'UpsertChristianGroup';
exports.upsertChristianGroupRef = upsertChristianGroupRef;

exports.upsertChristianGroup = function upsertChristianGroup(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertChristianGroupRef(dcInstance, inputVars));
}
;

const setChristianGroupActiveRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetChristianGroupActive', inputVars);
}
setChristianGroupActiveRef.operationName = 'SetChristianGroupActive';
exports.setChristianGroupActiveRef = setChristianGroupActiveRef;

exports.setChristianGroupActive = function setChristianGroupActive(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setChristianGroupActiveRef(dcInstance, inputVars));
}
;

const upsertPreBooksellerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPreBookseller', inputVars);
}
upsertPreBooksellerRef.operationName = 'UpsertPreBookseller';
exports.upsertPreBooksellerRef = upsertPreBooksellerRef;

exports.upsertPreBookseller = function upsertPreBookseller(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertPreBooksellerRef(dcInstance, inputVars));
}
;

const upsertSharedSchoolGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSharedSchoolGroup', inputVars);
}
upsertSharedSchoolGroupRef.operationName = 'UpsertSharedSchoolGroup';
exports.upsertSharedSchoolGroupRef = upsertSharedSchoolGroupRef;

exports.upsertSharedSchoolGroup = function upsertSharedSchoolGroup(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSharedSchoolGroupRef(dcInstance, inputVars));
}
;

const upsertSharedSchoolGroupLocationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSharedSchoolGroupLocation', inputVars);
}
upsertSharedSchoolGroupLocationRef.operationName = 'UpsertSharedSchoolGroupLocation';
exports.upsertSharedSchoolGroupLocationRef = upsertSharedSchoolGroupLocationRef;

exports.upsertSharedSchoolGroupLocation = function upsertSharedSchoolGroupLocation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSharedSchoolGroupLocationRef(dcInstance, inputVars));
}
;

const upsertSharedVendorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSharedVendor', inputVars);
}
upsertSharedVendorRef.operationName = 'UpsertSharedVendor';
exports.upsertSharedVendorRef = upsertSharedVendorRef;

exports.upsertSharedVendor = function upsertSharedVendor(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSharedVendorRef(dcInstance, inputVars));
}
;

const upsertSharedVendorSchoolRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSharedVendorSchool', inputVars);
}
upsertSharedVendorSchoolRef.operationName = 'UpsertSharedVendorSchool';
exports.upsertSharedVendorSchoolRef = upsertSharedVendorSchoolRef;

exports.upsertSharedVendorSchool = function upsertSharedVendorSchool(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSharedVendorSchoolRef(dcInstance, inputVars));
}
;

const upsertSharedPtCodeUsageHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSharedPtCodeUsageHistory', inputVars);
}
upsertSharedPtCodeUsageHistoryRef.operationName = 'UpsertSharedPtCodeUsageHistory';
exports.upsertSharedPtCodeUsageHistoryRef = upsertSharedPtCodeUsageHistoryRef;

exports.upsertSharedPtCodeUsageHistory = function upsertSharedPtCodeUsageHistory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSharedPtCodeUsageHistoryRef(dcInstance, inputVars));
}
;

const listOrganisationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOrganisations', inputVars);
}
listOrganisationsRef.operationName = 'ListOrganisations';
exports.listOrganisationsRef = listOrganisationsRef;

exports.listOrganisations = function listOrganisations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listOrganisationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const searchOrganisationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchOrganisations', inputVars);
}
searchOrganisationsRef.operationName = 'SearchOrganisations';
exports.searchOrganisationsRef = searchOrganisationsRef;

exports.searchOrganisations = function searchOrganisations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(searchOrganisationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getOrganisationByPrCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOrganisationByPrCode', inputVars);
}
getOrganisationByPrCodeRef.operationName = 'GetOrganisationByPrCode';
exports.getOrganisationByPrCodeRef = getOrganisationByPrCodeRef;

exports.getOrganisationByPrCode = function getOrganisationByPrCode(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getOrganisationByPrCodeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listBooksellerDiscountsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListBooksellerDiscounts', inputVars);
}
listBooksellerDiscountsRef.operationName = 'ListBooksellerDiscounts';
exports.listBooksellerDiscountsRef = listBooksellerDiscountsRef;

exports.listBooksellerDiscounts = function listBooksellerDiscounts(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listBooksellerDiscountsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listBooksellersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListBooksellers', inputVars);
}
listBooksellersRef.operationName = 'ListBooksellers';
exports.listBooksellersRef = listBooksellersRef;

exports.listBooksellers = function listBooksellers(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listBooksellersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBooksellerByCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBooksellerByCode', inputVars);
}
getBooksellerByCodeRef.operationName = 'GetBooksellerByCode';
exports.getBooksellerByCodeRef = getBooksellerByCodeRef;

exports.getBooksellerByCode = function getBooksellerByCode(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBooksellerByCodeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listItemsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListItems', inputVars);
}
listItemsRef.operationName = 'ListItems';
exports.listItemsRef = listItemsRef;

exports.listItems = function listItems(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listItemsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getItemByCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetItemByCode', inputVars);
}
getItemByCodeRef.operationName = 'GetItemByCode';
exports.getItemByCodeRef = getItemByCodeRef;

exports.getItemByCode = function getItemByCode(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getItemByCodeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listBooksellerSchoolMappingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListBooksellerSchoolMapping', inputVars);
}
listBooksellerSchoolMappingRef.operationName = 'ListBooksellerSchoolMapping';
exports.listBooksellerSchoolMappingRef = listBooksellerSchoolMappingRef;

exports.listBooksellerSchoolMapping = function listBooksellerSchoolMapping(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listBooksellerSchoolMappingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedSchoolGroupsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedSchoolGroups', inputVars);
}
listSharedSchoolGroupsRef.operationName = 'ListSharedSchoolGroups';
exports.listSharedSchoolGroupsRef = listSharedSchoolGroupsRef;

exports.listSharedSchoolGroups = function listSharedSchoolGroups(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedSchoolGroupsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedSchoolGroupLocationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedSchoolGroupLocations', inputVars);
}
listSharedSchoolGroupLocationsRef.operationName = 'ListSharedSchoolGroupLocations';
exports.listSharedSchoolGroupLocationsRef = listSharedSchoolGroupLocationsRef;

exports.listSharedSchoolGroupLocations = function listSharedSchoolGroupLocations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedSchoolGroupLocationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedChristianGroupsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedChristianGroups', inputVars);
}
listSharedChristianGroupsRef.operationName = 'ListSharedChristianGroups';
exports.listSharedChristianGroupsRef = listSharedChristianGroupsRef;

exports.listSharedChristianGroups = function listSharedChristianGroups(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedChristianGroupsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedPreBooksellersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedPreBooksellers', inputVars);
}
listSharedPreBooksellersRef.operationName = 'ListSharedPreBooksellers';
exports.listSharedPreBooksellersRef = listSharedPreBooksellersRef;

exports.listSharedPreBooksellers = function listSharedPreBooksellers(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedPreBooksellersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedVendorsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedVendors', inputVars);
}
listSharedVendorsRef.operationName = 'ListSharedVendors';
exports.listSharedVendorsRef = listSharedVendorsRef;

exports.listSharedVendors = function listSharedVendors(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedVendorsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedVendorSchoolsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedVendorSchools', inputVars);
}
listSharedVendorSchoolsRef.operationName = 'ListSharedVendorSchools';
exports.listSharedVendorSchoolsRef = listSharedVendorSchoolsRef;

exports.listSharedVendorSchools = function listSharedVendorSchools(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedVendorSchoolsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listSharedPtCodeUsageHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSharedPtCodeUsageHistory', inputVars);
}
listSharedPtCodeUsageHistoryRef.operationName = 'ListSharedPtCodeUsageHistory';
exports.listSharedPtCodeUsageHistoryRef = listSharedPtCodeUsageHistoryRef;

exports.listSharedPtCodeUsageHistory = function listSharedPtCodeUsageHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listSharedPtCodeUsageHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
