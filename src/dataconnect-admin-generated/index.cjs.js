const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'system-order-34c0a-service',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;

function setBooksellerActualDiscount(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SetBooksellerActualDiscount', inputVars, inputOpts);
}
exports.setBooksellerActualDiscount = setBooksellerActualDiscount;

function upsertChristianGroup(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertChristianGroup', inputVars, inputOpts);
}
exports.upsertChristianGroup = upsertChristianGroup;

function setChristianGroupActive(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SetChristianGroupActive', inputVars, inputOpts);
}
exports.setChristianGroupActive = setChristianGroupActive;

function upsertPreBookseller(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertPreBookseller', inputVars, inputOpts);
}
exports.upsertPreBookseller = upsertPreBookseller;

function upsertSharedSchoolGroup(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertSharedSchoolGroup', inputVars, inputOpts);
}
exports.upsertSharedSchoolGroup = upsertSharedSchoolGroup;

function upsertSharedSchoolGroupLocation(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertSharedSchoolGroupLocation', inputVars, inputOpts);
}
exports.upsertSharedSchoolGroupLocation = upsertSharedSchoolGroupLocation;

function upsertSharedVendor(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertSharedVendor', inputVars, inputOpts);
}
exports.upsertSharedVendor = upsertSharedVendor;

function upsertSharedVendorSchool(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertSharedVendorSchool', inputVars, inputOpts);
}
exports.upsertSharedVendorSchool = upsertSharedVendorSchool;

function upsertSharedPtCodeUsageHistory(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertSharedPtCodeUsageHistory', inputVars, inputOpts);
}
exports.upsertSharedPtCodeUsageHistory = upsertSharedPtCodeUsageHistory;

function listOrganisations(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListOrganisations', inputVars, inputOpts);
}
exports.listOrganisations = listOrganisations;

function searchOrganisations(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('SearchOrganisations', inputVars, inputOpts);
}
exports.searchOrganisations = searchOrganisations;

function getOrganisationByPrCode(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetOrganisationByPrCode', inputVars, inputOpts);
}
exports.getOrganisationByPrCode = getOrganisationByPrCode;

function listBooksellerDiscounts(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListBooksellerDiscounts', inputVars, inputOpts);
}
exports.listBooksellerDiscounts = listBooksellerDiscounts;

function listBooksellers(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListBooksellers', inputVars, inputOpts);
}
exports.listBooksellers = listBooksellers;

function getBooksellerByCode(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetBooksellerByCode', inputVars, inputOpts);
}
exports.getBooksellerByCode = getBooksellerByCode;

function listItems(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListItems', inputVars, inputOpts);
}
exports.listItems = listItems;

function getItemByCode(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetItemByCode', inputVars, inputOpts);
}
exports.getItemByCode = getItemByCode;

function listBooksellerSchoolMapping(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListBooksellerSchoolMapping', inputVars, inputOpts);
}
exports.listBooksellerSchoolMapping = listBooksellerSchoolMapping;

function listSharedSchoolGroups(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedSchoolGroups', inputVars, inputOpts);
}
exports.listSharedSchoolGroups = listSharedSchoolGroups;

function listSharedSchoolGroupLocations(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedSchoolGroupLocations', inputVars, inputOpts);
}
exports.listSharedSchoolGroupLocations = listSharedSchoolGroupLocations;

function listSharedChristianGroups(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedChristianGroups', inputVars, inputOpts);
}
exports.listSharedChristianGroups = listSharedChristianGroups;

function listSharedPreBooksellers(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedPreBooksellers', inputVars, inputOpts);
}
exports.listSharedPreBooksellers = listSharedPreBooksellers;

function listSharedVendors(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedVendors', inputVars, inputOpts);
}
exports.listSharedVendors = listSharedVendors;

function listSharedVendorSchools(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedVendorSchools', inputVars, inputOpts);
}
exports.listSharedVendorSchools = listSharedVendorSchools;

function listSharedPtCodeUsageHistory(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSharedPtCodeUsageHistory', inputVars, inputOpts);
}
exports.listSharedPtCodeUsageHistory = listSharedPtCodeUsageHistory;

