# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListOrganisations*](#listorganisations)
  - [*SearchOrganisations*](#searchorganisations)
  - [*GetOrganisationByPrCode*](#getorganisationbyprcode)
  - [*ListBooksellerDiscounts*](#listbooksellerdiscounts)
  - [*ListBooksellers*](#listbooksellers)
  - [*GetBooksellerByCode*](#getbooksellerbycode)
  - [*ListItems*](#listitems)
  - [*GetItemByCode*](#getitembycode)
  - [*ListBooksellerSchoolMapping*](#listbooksellerschoolmapping)
  - [*ListSharedSchoolGroups*](#listsharedschoolgroups)
  - [*ListSharedSchoolGroupLocations*](#listsharedschoolgrouplocations)
  - [*ListSharedChristianGroups*](#listsharedchristiangroups)
  - [*ListSharedPreBooksellers*](#listsharedprebooksellers)
  - [*ListSharedVendors*](#listsharedvendors)
  - [*ListSharedVendorSchools*](#listsharedvendorschools)
  - [*ListSharedPtCodeUsageHistory*](#listsharedptcodeusagehistory)
  - [*ListSharedExecutives*](#listsharedexecutives)
  - [*ListSharedSchoolExecutiveDefaults*](#listsharedschoolexecutivedefaults)
- [**Mutations**](#mutations)
  - [*SetBooksellerActualDiscount*](#setbookselleractualdiscount)
  - [*UpsertChristianGroup*](#upsertchristiangroup)
  - [*SetChristianGroupActive*](#setchristiangroupactive)
  - [*UpsertPreBookseller*](#upsertprebookseller)
  - [*UpsertSharedSchoolGroup*](#upsertsharedschoolgroup)
  - [*UpsertSharedSchoolGroupLocation*](#upsertsharedschoolgrouplocation)
  - [*UpsertSharedVendor*](#upsertsharedvendor)
  - [*UpsertSharedVendorSchool*](#upsertsharedvendorschool)
  - [*UpsertSharedPtCodeUsageHistory*](#upsertsharedptcodeusagehistory)
  - [*UpsertSharedExecutive*](#upsertsharedexecutive)
  - [*UpsertSharedSchoolExecutiveDefault*](#upsertsharedschoolexecutivedefault)
  - [*UpsertSharedOrderSchoolExecutive*](#upsertsharedorderschoolexecutive)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListOrganisations
You can execute the `ListOrganisations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listOrganisations(vars?: ListOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, ListOrganisationsVariables>;

interface ListOrganisationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListOrganisationsVariables): QueryRef<ListOrganisationsData, ListOrganisationsVariables>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrganisations(dc: DataConnect, vars?: ListOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, ListOrganisationsVariables>;

interface ListOrganisationsRef {
  ...
  (dc: DataConnect, vars?: ListOrganisationsVariables): QueryRef<ListOrganisationsData, ListOrganisationsVariables>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrganisationsRef:
```typescript
const name = listOrganisationsRef.operationName;
console.log(name);
```

### Variables
The `ListOrganisations` query has an optional argument of type `ListOrganisationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListOrganisationsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListOrganisations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListOrganisations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrganisations, ListOrganisationsVariables } from '@dataconnect/generated';

// The `ListOrganisations` query has an optional argument of type `ListOrganisationsVariables`:
const listOrganisationsVars: ListOrganisationsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listOrganisations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrganisations(listOrganisationsVars);
// Variables can be defined inline as well.
const { data } = await listOrganisations({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListOrganisationsVariables` argument.
const { data } = await listOrganisations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrganisations(dataConnect, listOrganisationsVars);

console.log(data.organisations);

// Or, you can use the `Promise` API.
listOrganisations(listOrganisationsVars).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

### Using `ListOrganisations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrganisationsRef, ListOrganisationsVariables } from '@dataconnect/generated';

// The `ListOrganisations` query has an optional argument of type `ListOrganisationsVariables`:
const listOrganisationsVars: ListOrganisationsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listOrganisationsRef()` function to get a reference to the query.
const ref = listOrganisationsRef(listOrganisationsVars);
// Variables can be defined inline as well.
const ref = listOrganisationsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListOrganisationsVariables` argument.
const ref = listOrganisationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrganisationsRef(dataConnect, listOrganisationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organisations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

## SearchOrganisations
You can execute the `SearchOrganisations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchOrganisations(vars?: SearchOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchOrganisationsData, SearchOrganisationsVariables>;

interface SearchOrganisationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchOrganisationsVariables): QueryRef<SearchOrganisationsData, SearchOrganisationsVariables>;
}
export const searchOrganisationsRef: SearchOrganisationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchOrganisationsData, SearchOrganisationsVariables>;

interface SearchOrganisationsRef {
  ...
  (dc: DataConnect, vars?: SearchOrganisationsVariables): QueryRef<SearchOrganisationsData, SearchOrganisationsVariables>;
}
export const searchOrganisationsRef: SearchOrganisationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchOrganisationsRef:
```typescript
const name = searchOrganisationsRef.operationName;
console.log(name);
```

### Variables
The `SearchOrganisations` query has an optional argument of type `SearchOrganisationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SearchOrganisations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SearchOrganisations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchOrganisations, SearchOrganisationsVariables } from '@dataconnect/generated';

// The `SearchOrganisations` query has an optional argument of type `SearchOrganisationsVariables`:
const searchOrganisationsVars: SearchOrganisationsVariables = {
  prCode: ..., // optional
  organisationName: ..., // optional
  district: ..., // optional
  state: ..., // optional
  actionStatus: ..., // optional
  workingStatus: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `searchOrganisations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchOrganisations(searchOrganisationsVars);
// Variables can be defined inline as well.
const { data } = await searchOrganisations({ prCode: ..., organisationName: ..., district: ..., state: ..., actionStatus: ..., workingStatus: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `SearchOrganisationsVariables` argument.
const { data } = await searchOrganisations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchOrganisations(dataConnect, searchOrganisationsVars);

console.log(data.organisations);

// Or, you can use the `Promise` API.
searchOrganisations(searchOrganisationsVars).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

### Using `SearchOrganisations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchOrganisationsRef, SearchOrganisationsVariables } from '@dataconnect/generated';

// The `SearchOrganisations` query has an optional argument of type `SearchOrganisationsVariables`:
const searchOrganisationsVars: SearchOrganisationsVariables = {
  prCode: ..., // optional
  organisationName: ..., // optional
  district: ..., // optional
  state: ..., // optional
  actionStatus: ..., // optional
  workingStatus: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `searchOrganisationsRef()` function to get a reference to the query.
const ref = searchOrganisationsRef(searchOrganisationsVars);
// Variables can be defined inline as well.
const ref = searchOrganisationsRef({ prCode: ..., organisationName: ..., district: ..., state: ..., actionStatus: ..., workingStatus: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `SearchOrganisationsVariables` argument.
const ref = searchOrganisationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchOrganisationsRef(dataConnect, searchOrganisationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organisations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

## GetOrganisationByPrCode
You can execute the `GetOrganisationByPrCode` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;

interface GetOrganisationByPrCodeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrganisationByPrCodeVariables): QueryRef<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
}
export const getOrganisationByPrCodeRef: GetOrganisationByPrCodeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;

interface GetOrganisationByPrCodeRef {
  ...
  (dc: DataConnect, vars: GetOrganisationByPrCodeVariables): QueryRef<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
}
export const getOrganisationByPrCodeRef: GetOrganisationByPrCodeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getOrganisationByPrCodeRef:
```typescript
const name = getOrganisationByPrCodeRef.operationName;
console.log(name);
```

### Variables
The `GetOrganisationByPrCode` query requires an argument of type `GetOrganisationByPrCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetOrganisationByPrCodeVariables {
  prCode: string;
}
```
### Return Type
Recall that executing the `GetOrganisationByPrCode` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetOrganisationByPrCodeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetOrganisationByPrCode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getOrganisationByPrCode, GetOrganisationByPrCodeVariables } from '@dataconnect/generated';

// The `GetOrganisationByPrCode` query requires an argument of type `GetOrganisationByPrCodeVariables`:
const getOrganisationByPrCodeVars: GetOrganisationByPrCodeVariables = {
  prCode: ..., 
};

// Call the `getOrganisationByPrCode()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getOrganisationByPrCode(getOrganisationByPrCodeVars);
// Variables can be defined inline as well.
const { data } = await getOrganisationByPrCode({ prCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getOrganisationByPrCode(dataConnect, getOrganisationByPrCodeVars);

console.log(data.organisations);

// Or, you can use the `Promise` API.
getOrganisationByPrCode(getOrganisationByPrCodeVars).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

### Using `GetOrganisationByPrCode`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getOrganisationByPrCodeRef, GetOrganisationByPrCodeVariables } from '@dataconnect/generated';

// The `GetOrganisationByPrCode` query requires an argument of type `GetOrganisationByPrCodeVariables`:
const getOrganisationByPrCodeVars: GetOrganisationByPrCodeVariables = {
  prCode: ..., 
};

// Call the `getOrganisationByPrCodeRef()` function to get a reference to the query.
const ref = getOrganisationByPrCodeRef(getOrganisationByPrCodeVars);
// Variables can be defined inline as well.
const ref = getOrganisationByPrCodeRef({ prCode: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getOrganisationByPrCodeRef(dataConnect, getOrganisationByPrCodeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organisations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

## ListBooksellerDiscounts
You can execute the `ListBooksellerDiscounts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBooksellerDiscounts(vars?: ListBooksellerDiscountsVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;

interface ListBooksellerDiscountsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListBooksellerDiscountsVariables): QueryRef<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;
}
export const listBooksellerDiscountsRef: ListBooksellerDiscountsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooksellerDiscounts(dc: DataConnect, vars?: ListBooksellerDiscountsVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;

interface ListBooksellerDiscountsRef {
  ...
  (dc: DataConnect, vars?: ListBooksellerDiscountsVariables): QueryRef<ListBooksellerDiscountsData, ListBooksellerDiscountsVariables>;
}
export const listBooksellerDiscountsRef: ListBooksellerDiscountsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksellerDiscountsRef:
```typescript
const name = listBooksellerDiscountsRef.operationName;
console.log(name);
```

### Variables
The `ListBooksellerDiscounts` query has an optional argument of type `ListBooksellerDiscountsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListBooksellerDiscountsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListBooksellerDiscounts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBooksellerDiscountsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListBooksellerDiscounts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBooksellerDiscounts, ListBooksellerDiscountsVariables } from '@dataconnect/generated';

// The `ListBooksellerDiscounts` query has an optional argument of type `ListBooksellerDiscountsVariables`:
const listBooksellerDiscountsVars: ListBooksellerDiscountsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellerDiscounts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooksellerDiscounts(listBooksellerDiscountsVars);
// Variables can be defined inline as well.
const { data } = await listBooksellerDiscounts({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellerDiscountsVariables` argument.
const { data } = await listBooksellerDiscounts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooksellerDiscounts(dataConnect, listBooksellerDiscountsVars);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
listBooksellerDiscounts(listBooksellerDiscountsVars).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

### Using `ListBooksellerDiscounts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksellerDiscountsRef, ListBooksellerDiscountsVariables } from '@dataconnect/generated';

// The `ListBooksellerDiscounts` query has an optional argument of type `ListBooksellerDiscountsVariables`:
const listBooksellerDiscountsVars: ListBooksellerDiscountsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellerDiscountsRef()` function to get a reference to the query.
const ref = listBooksellerDiscountsRef(listBooksellerDiscountsVars);
// Variables can be defined inline as well.
const ref = listBooksellerDiscountsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellerDiscountsVariables` argument.
const ref = listBooksellerDiscountsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksellerDiscountsRef(dataConnect, listBooksellerDiscountsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

## ListBooksellers
You can execute the `ListBooksellers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBooksellers(vars?: ListBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, ListBooksellersVariables>;

interface ListBooksellersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListBooksellersVariables): QueryRef<ListBooksellersData, ListBooksellersVariables>;
}
export const listBooksellersRef: ListBooksellersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooksellers(dc: DataConnect, vars?: ListBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, ListBooksellersVariables>;

interface ListBooksellersRef {
  ...
  (dc: DataConnect, vars?: ListBooksellersVariables): QueryRef<ListBooksellersData, ListBooksellersVariables>;
}
export const listBooksellersRef: ListBooksellersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksellersRef:
```typescript
const name = listBooksellersRef.operationName;
console.log(name);
```

### Variables
The `ListBooksellers` query has an optional argument of type `ListBooksellersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListBooksellers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBooksellersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListBooksellers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBooksellers, ListBooksellersVariables } from '@dataconnect/generated';

// The `ListBooksellers` query has an optional argument of type `ListBooksellersVariables`:
const listBooksellersVars: ListBooksellersVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooksellers(listBooksellersVars);
// Variables can be defined inline as well.
const { data } = await listBooksellers({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellersVariables` argument.
const { data } = await listBooksellers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooksellers(dataConnect, listBooksellersVars);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
listBooksellers(listBooksellersVars).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

### Using `ListBooksellers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksellersRef, ListBooksellersVariables } from '@dataconnect/generated';

// The `ListBooksellers` query has an optional argument of type `ListBooksellersVariables`:
const listBooksellersVars: ListBooksellersVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellersRef()` function to get a reference to the query.
const ref = listBooksellersRef(listBooksellersVars);
// Variables can be defined inline as well.
const ref = listBooksellersRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellersVariables` argument.
const ref = listBooksellersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksellersRef(dataConnect, listBooksellersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

## GetBooksellerByCode
You can execute the `GetBooksellerByCode` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;

interface GetBooksellerByCodeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBooksellerByCodeVariables): QueryRef<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
}
export const getBooksellerByCodeRef: GetBooksellerByCodeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;

interface GetBooksellerByCodeRef {
  ...
  (dc: DataConnect, vars: GetBooksellerByCodeVariables): QueryRef<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
}
export const getBooksellerByCodeRef: GetBooksellerByCodeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBooksellerByCodeRef:
```typescript
const name = getBooksellerByCodeRef.operationName;
console.log(name);
```

### Variables
The `GetBooksellerByCode` query requires an argument of type `GetBooksellerByCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBooksellerByCodeVariables {
  booksellerCode: string;
}
```
### Return Type
Recall that executing the `GetBooksellerByCode` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBooksellerByCodeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBooksellerByCode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBooksellerByCode, GetBooksellerByCodeVariables } from '@dataconnect/generated';

// The `GetBooksellerByCode` query requires an argument of type `GetBooksellerByCodeVariables`:
const getBooksellerByCodeVars: GetBooksellerByCodeVariables = {
  booksellerCode: ..., 
};

// Call the `getBooksellerByCode()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBooksellerByCode(getBooksellerByCodeVars);
// Variables can be defined inline as well.
const { data } = await getBooksellerByCode({ booksellerCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBooksellerByCode(dataConnect, getBooksellerByCodeVars);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
getBooksellerByCode(getBooksellerByCodeVars).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

### Using `GetBooksellerByCode`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBooksellerByCodeRef, GetBooksellerByCodeVariables } from '@dataconnect/generated';

// The `GetBooksellerByCode` query requires an argument of type `GetBooksellerByCodeVariables`:
const getBooksellerByCodeVars: GetBooksellerByCodeVariables = {
  booksellerCode: ..., 
};

// Call the `getBooksellerByCodeRef()` function to get a reference to the query.
const ref = getBooksellerByCodeRef(getBooksellerByCodeVars);
// Variables can be defined inline as well.
const ref = getBooksellerByCodeRef({ booksellerCode: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBooksellerByCodeRef(dataConnect, getBooksellerByCodeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

## ListItems
You can execute the `ListItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listItems(vars?: ListItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, ListItemsVariables>;

interface ListItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListItemsVariables): QueryRef<ListItemsData, ListItemsVariables>;
}
export const listItemsRef: ListItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listItems(dc: DataConnect, vars?: ListItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, ListItemsVariables>;

interface ListItemsRef {
  ...
  (dc: DataConnect, vars?: ListItemsVariables): QueryRef<ListItemsData, ListItemsVariables>;
}
export const listItemsRef: ListItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listItemsRef:
```typescript
const name = listItemsRef.operationName;
console.log(name);
```

### Variables
The `ListItems` query has an optional argument of type `ListItemsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListItemsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListItemsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listItems, ListItemsVariables } from '@dataconnect/generated';

// The `ListItems` query has an optional argument of type `ListItemsVariables`:
const listItemsVars: ListItemsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listItems(listItemsVars);
// Variables can be defined inline as well.
const { data } = await listItems({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListItemsVariables` argument.
const { data } = await listItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listItems(dataConnect, listItemsVars);

console.log(data.items);

// Or, you can use the `Promise` API.
listItems(listItemsVars).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `ListItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listItemsRef, ListItemsVariables } from '@dataconnect/generated';

// The `ListItems` query has an optional argument of type `ListItemsVariables`:
const listItemsVars: ListItemsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listItemsRef()` function to get a reference to the query.
const ref = listItemsRef(listItemsVars);
// Variables can be defined inline as well.
const ref = listItemsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListItemsVariables` argument.
const ref = listItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listItemsRef(dataConnect, listItemsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

## GetItemByCode
You can execute the `GetItemByCode` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getItemByCode(vars: GetItemByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemByCodeData, GetItemByCodeVariables>;

interface GetItemByCodeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemByCodeVariables): QueryRef<GetItemByCodeData, GetItemByCodeVariables>;
}
export const getItemByCodeRef: GetItemByCodeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemByCodeData, GetItemByCodeVariables>;

interface GetItemByCodeRef {
  ...
  (dc: DataConnect, vars: GetItemByCodeVariables): QueryRef<GetItemByCodeData, GetItemByCodeVariables>;
}
export const getItemByCodeRef: GetItemByCodeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getItemByCodeRef:
```typescript
const name = getItemByCodeRef.operationName;
console.log(name);
```

### Variables
The `GetItemByCode` query requires an argument of type `GetItemByCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetItemByCodeVariables {
  itemCode: string;
}
```
### Return Type
Recall that executing the `GetItemByCode` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetItemByCodeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetItemByCode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getItemByCode, GetItemByCodeVariables } from '@dataconnect/generated';

// The `GetItemByCode` query requires an argument of type `GetItemByCodeVariables`:
const getItemByCodeVars: GetItemByCodeVariables = {
  itemCode: ..., 
};

// Call the `getItemByCode()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getItemByCode(getItemByCodeVars);
// Variables can be defined inline as well.
const { data } = await getItemByCode({ itemCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getItemByCode(dataConnect, getItemByCodeVars);

console.log(data.items);

// Or, you can use the `Promise` API.
getItemByCode(getItemByCodeVars).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `GetItemByCode`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getItemByCodeRef, GetItemByCodeVariables } from '@dataconnect/generated';

// The `GetItemByCode` query requires an argument of type `GetItemByCodeVariables`:
const getItemByCodeVars: GetItemByCodeVariables = {
  itemCode: ..., 
};

// Call the `getItemByCodeRef()` function to get a reference to the query.
const ref = getItemByCodeRef(getItemByCodeVars);
// Variables can be defined inline as well.
const ref = getItemByCodeRef({ itemCode: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getItemByCodeRef(dataConnect, getItemByCodeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

## ListBooksellerSchoolMapping
You can execute the `ListBooksellerSchoolMapping` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBooksellerSchoolMapping(vars?: ListBooksellerSchoolMappingVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;

interface ListBooksellerSchoolMappingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListBooksellerSchoolMappingVariables): QueryRef<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooksellerSchoolMapping(dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;

interface ListBooksellerSchoolMappingRef {
  ...
  (dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables): QueryRef<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksellerSchoolMappingRef:
```typescript
const name = listBooksellerSchoolMappingRef.operationName;
console.log(name);
```

### Variables
The `ListBooksellerSchoolMapping` query has an optional argument of type `ListBooksellerSchoolMappingVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListBooksellerSchoolMappingVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListBooksellerSchoolMapping` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBooksellerSchoolMappingData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBooksellerSchoolMappingData {
  booksellerSchoolMappings: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    ptCode: string;
  } & BooksellerSchoolMapping_Key)[];
}
```
### Using `ListBooksellerSchoolMapping`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBooksellerSchoolMapping, ListBooksellerSchoolMappingVariables } from '@dataconnect/generated';

// The `ListBooksellerSchoolMapping` query has an optional argument of type `ListBooksellerSchoolMappingVariables`:
const listBooksellerSchoolMappingVars: ListBooksellerSchoolMappingVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellerSchoolMapping()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooksellerSchoolMapping(listBooksellerSchoolMappingVars);
// Variables can be defined inline as well.
const { data } = await listBooksellerSchoolMapping({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellerSchoolMappingVariables` argument.
const { data } = await listBooksellerSchoolMapping();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooksellerSchoolMapping(dataConnect, listBooksellerSchoolMappingVars);

console.log(data.booksellerSchoolMappings);

// Or, you can use the `Promise` API.
listBooksellerSchoolMapping(listBooksellerSchoolMappingVars).then((response) => {
  const data = response.data;
  console.log(data.booksellerSchoolMappings);
});
```

### Using `ListBooksellerSchoolMapping`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksellerSchoolMappingRef, ListBooksellerSchoolMappingVariables } from '@dataconnect/generated';

// The `ListBooksellerSchoolMapping` query has an optional argument of type `ListBooksellerSchoolMappingVariables`:
const listBooksellerSchoolMappingVars: ListBooksellerSchoolMappingVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listBooksellerSchoolMappingRef()` function to get a reference to the query.
const ref = listBooksellerSchoolMappingRef(listBooksellerSchoolMappingVars);
// Variables can be defined inline as well.
const ref = listBooksellerSchoolMappingRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListBooksellerSchoolMappingVariables` argument.
const ref = listBooksellerSchoolMappingRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksellerSchoolMappingRef(dataConnect, listBooksellerSchoolMappingVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.booksellerSchoolMappings);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.booksellerSchoolMappings);
});
```

## ListSharedSchoolGroups
You can execute the `ListSharedSchoolGroups` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedSchoolGroups(vars?: ListSharedSchoolGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;

interface ListSharedSchoolGroupsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedSchoolGroupsVariables): QueryRef<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
}
export const listSharedSchoolGroupsRef: ListSharedSchoolGroupsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedSchoolGroups(dc: DataConnect, vars?: ListSharedSchoolGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;

interface ListSharedSchoolGroupsRef {
  ...
  (dc: DataConnect, vars?: ListSharedSchoolGroupsVariables): QueryRef<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
}
export const listSharedSchoolGroupsRef: ListSharedSchoolGroupsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedSchoolGroupsRef:
```typescript
const name = listSharedSchoolGroupsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedSchoolGroups` query has an optional argument of type `ListSharedSchoolGroupsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedSchoolGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedSchoolGroups` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedSchoolGroupsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSharedSchoolGroupsData {
  sharedSchoolGroups: ({
    id: Int64String;
    groupCode: string;
    groupName: string;
    active: boolean;
    syncedAt: TimestampString;
  } & SharedSchoolGroup_Key)[];
}
```
### Using `ListSharedSchoolGroups`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolGroups, ListSharedSchoolGroupsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolGroups` query has an optional argument of type `ListSharedSchoolGroupsVariables`:
const listSharedSchoolGroupsVars: ListSharedSchoolGroupsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolGroups()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedSchoolGroups(listSharedSchoolGroupsVars);
// Variables can be defined inline as well.
const { data } = await listSharedSchoolGroups({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolGroupsVariables` argument.
const { data } = await listSharedSchoolGroups();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedSchoolGroups(dataConnect, listSharedSchoolGroupsVars);

console.log(data.sharedSchoolGroups);

// Or, you can use the `Promise` API.
listSharedSchoolGroups(listSharedSchoolGroupsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroups);
});
```

### Using `ListSharedSchoolGroups`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolGroupsRef, ListSharedSchoolGroupsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolGroups` query has an optional argument of type `ListSharedSchoolGroupsVariables`:
const listSharedSchoolGroupsVars: ListSharedSchoolGroupsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolGroupsRef()` function to get a reference to the query.
const ref = listSharedSchoolGroupsRef(listSharedSchoolGroupsVars);
// Variables can be defined inline as well.
const ref = listSharedSchoolGroupsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolGroupsVariables` argument.
const ref = listSharedSchoolGroupsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedSchoolGroupsRef(dataConnect, listSharedSchoolGroupsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedSchoolGroups);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroups);
});
```

## ListSharedSchoolGroupLocations
You can execute the `ListSharedSchoolGroupLocations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedSchoolGroupLocations(vars?: ListSharedSchoolGroupLocationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;

interface ListSharedSchoolGroupLocationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedSchoolGroupLocationsVariables): QueryRef<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
}
export const listSharedSchoolGroupLocationsRef: ListSharedSchoolGroupLocationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedSchoolGroupLocations(dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;

interface ListSharedSchoolGroupLocationsRef {
  ...
  (dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables): QueryRef<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
}
export const listSharedSchoolGroupLocationsRef: ListSharedSchoolGroupLocationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedSchoolGroupLocationsRef:
```typescript
const name = listSharedSchoolGroupLocationsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedSchoolGroupLocations` query has an optional argument of type `ListSharedSchoolGroupLocationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedSchoolGroupLocationsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedSchoolGroupLocations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedSchoolGroupLocationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSharedSchoolGroupLocations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolGroupLocations, ListSharedSchoolGroupLocationsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolGroupLocations` query has an optional argument of type `ListSharedSchoolGroupLocationsVariables`:
const listSharedSchoolGroupLocationsVars: ListSharedSchoolGroupLocationsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolGroupLocations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedSchoolGroupLocations(listSharedSchoolGroupLocationsVars);
// Variables can be defined inline as well.
const { data } = await listSharedSchoolGroupLocations({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolGroupLocationsVariables` argument.
const { data } = await listSharedSchoolGroupLocations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedSchoolGroupLocations(dataConnect, listSharedSchoolGroupLocationsVars);

console.log(data.sharedSchoolGroupLocations);

// Or, you can use the `Promise` API.
listSharedSchoolGroupLocations(listSharedSchoolGroupLocationsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroupLocations);
});
```

### Using `ListSharedSchoolGroupLocations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolGroupLocationsRef, ListSharedSchoolGroupLocationsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolGroupLocations` query has an optional argument of type `ListSharedSchoolGroupLocationsVariables`:
const listSharedSchoolGroupLocationsVars: ListSharedSchoolGroupLocationsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolGroupLocationsRef()` function to get a reference to the query.
const ref = listSharedSchoolGroupLocationsRef(listSharedSchoolGroupLocationsVars);
// Variables can be defined inline as well.
const ref = listSharedSchoolGroupLocationsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolGroupLocationsVariables` argument.
const ref = listSharedSchoolGroupLocationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedSchoolGroupLocationsRef(dataConnect, listSharedSchoolGroupLocationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedSchoolGroupLocations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroupLocations);
});
```

## ListSharedChristianGroups
You can execute the `ListSharedChristianGroups` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedChristianGroups(vars?: ListSharedChristianGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;

interface ListSharedChristianGroupsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedChristianGroupsVariables): QueryRef<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
}
export const listSharedChristianGroupsRef: ListSharedChristianGroupsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedChristianGroups(dc: DataConnect, vars?: ListSharedChristianGroupsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;

interface ListSharedChristianGroupsRef {
  ...
  (dc: DataConnect, vars?: ListSharedChristianGroupsVariables): QueryRef<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
}
export const listSharedChristianGroupsRef: ListSharedChristianGroupsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedChristianGroupsRef:
```typescript
const name = listSharedChristianGroupsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedChristianGroups` query has an optional argument of type `ListSharedChristianGroupsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedChristianGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedChristianGroups` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedChristianGroupsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSharedChristianGroups`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedChristianGroups, ListSharedChristianGroupsVariables } from '@dataconnect/generated';

// The `ListSharedChristianGroups` query has an optional argument of type `ListSharedChristianGroupsVariables`:
const listSharedChristianGroupsVars: ListSharedChristianGroupsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedChristianGroups()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedChristianGroups(listSharedChristianGroupsVars);
// Variables can be defined inline as well.
const { data } = await listSharedChristianGroups({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedChristianGroupsVariables` argument.
const { data } = await listSharedChristianGroups();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedChristianGroups(dataConnect, listSharedChristianGroupsVars);

console.log(data.sharedChristianGroups);

// Or, you can use the `Promise` API.
listSharedChristianGroups(listSharedChristianGroupsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroups);
});
```

### Using `ListSharedChristianGroups`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedChristianGroupsRef, ListSharedChristianGroupsVariables } from '@dataconnect/generated';

// The `ListSharedChristianGroups` query has an optional argument of type `ListSharedChristianGroupsVariables`:
const listSharedChristianGroupsVars: ListSharedChristianGroupsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedChristianGroupsRef()` function to get a reference to the query.
const ref = listSharedChristianGroupsRef(listSharedChristianGroupsVars);
// Variables can be defined inline as well.
const ref = listSharedChristianGroupsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedChristianGroupsVariables` argument.
const ref = listSharedChristianGroupsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedChristianGroupsRef(dataConnect, listSharedChristianGroupsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedChristianGroups);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroups);
});
```

## ListSharedPreBooksellers
You can execute the `ListSharedPreBooksellers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedPreBooksellers(vars?: ListSharedPreBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;

interface ListSharedPreBooksellersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedPreBooksellersVariables): QueryRef<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
}
export const listSharedPreBooksellersRef: ListSharedPreBooksellersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedPreBooksellers(dc: DataConnect, vars?: ListSharedPreBooksellersVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;

interface ListSharedPreBooksellersRef {
  ...
  (dc: DataConnect, vars?: ListSharedPreBooksellersVariables): QueryRef<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
}
export const listSharedPreBooksellersRef: ListSharedPreBooksellersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedPreBooksellersRef:
```typescript
const name = listSharedPreBooksellersRef.operationName;
console.log(name);
```

### Variables
The `ListSharedPreBooksellers` query has an optional argument of type `ListSharedPreBooksellersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedPreBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedPreBooksellers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedPreBooksellersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSharedPreBooksellers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedPreBooksellers, ListSharedPreBooksellersVariables } from '@dataconnect/generated';

// The `ListSharedPreBooksellers` query has an optional argument of type `ListSharedPreBooksellersVariables`:
const listSharedPreBooksellersVars: ListSharedPreBooksellersVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedPreBooksellers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedPreBooksellers(listSharedPreBooksellersVars);
// Variables can be defined inline as well.
const { data } = await listSharedPreBooksellers({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedPreBooksellersVariables` argument.
const { data } = await listSharedPreBooksellers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedPreBooksellers(dataConnect, listSharedPreBooksellersVars);

console.log(data.sharedPreBooksellers);

// Or, you can use the `Promise` API.
listSharedPreBooksellers(listSharedPreBooksellersVars).then((response) => {
  const data = response.data;
  console.log(data.sharedPreBooksellers);
});
```

### Using `ListSharedPreBooksellers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedPreBooksellersRef, ListSharedPreBooksellersVariables } from '@dataconnect/generated';

// The `ListSharedPreBooksellers` query has an optional argument of type `ListSharedPreBooksellersVariables`:
const listSharedPreBooksellersVars: ListSharedPreBooksellersVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedPreBooksellersRef()` function to get a reference to the query.
const ref = listSharedPreBooksellersRef(listSharedPreBooksellersVars);
// Variables can be defined inline as well.
const ref = listSharedPreBooksellersRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedPreBooksellersVariables` argument.
const ref = listSharedPreBooksellersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedPreBooksellersRef(dataConnect, listSharedPreBooksellersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedPreBooksellers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedPreBooksellers);
});
```

## ListSharedVendors
You can execute the `ListSharedVendors` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedVendors(vars?: ListSharedVendorsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorsData, ListSharedVendorsVariables>;

interface ListSharedVendorsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedVendorsVariables): QueryRef<ListSharedVendorsData, ListSharedVendorsVariables>;
}
export const listSharedVendorsRef: ListSharedVendorsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedVendors(dc: DataConnect, vars?: ListSharedVendorsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorsData, ListSharedVendorsVariables>;

interface ListSharedVendorsRef {
  ...
  (dc: DataConnect, vars?: ListSharedVendorsVariables): QueryRef<ListSharedVendorsData, ListSharedVendorsVariables>;
}
export const listSharedVendorsRef: ListSharedVendorsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedVendorsRef:
```typescript
const name = listSharedVendorsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedVendors` query has an optional argument of type `ListSharedVendorsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedVendorsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedVendors` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedVendorsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSharedVendors`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedVendors, ListSharedVendorsVariables } from '@dataconnect/generated';

// The `ListSharedVendors` query has an optional argument of type `ListSharedVendorsVariables`:
const listSharedVendorsVars: ListSharedVendorsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedVendors()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedVendors(listSharedVendorsVars);
// Variables can be defined inline as well.
const { data } = await listSharedVendors({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedVendorsVariables` argument.
const { data } = await listSharedVendors();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedVendors(dataConnect, listSharedVendorsVars);

console.log(data.sharedVendors);

// Or, you can use the `Promise` API.
listSharedVendors(listSharedVendorsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedVendors);
});
```

### Using `ListSharedVendors`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedVendorsRef, ListSharedVendorsVariables } from '@dataconnect/generated';

// The `ListSharedVendors` query has an optional argument of type `ListSharedVendorsVariables`:
const listSharedVendorsVars: ListSharedVendorsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedVendorsRef()` function to get a reference to the query.
const ref = listSharedVendorsRef(listSharedVendorsVars);
// Variables can be defined inline as well.
const ref = listSharedVendorsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedVendorsVariables` argument.
const ref = listSharedVendorsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedVendorsRef(dataConnect, listSharedVendorsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedVendors);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedVendors);
});
```

## ListSharedVendorSchools
You can execute the `ListSharedVendorSchools` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedVendorSchools(vars?: ListSharedVendorSchoolsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;

interface ListSharedVendorSchoolsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedVendorSchoolsVariables): QueryRef<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;
}
export const listSharedVendorSchoolsRef: ListSharedVendorSchoolsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedVendorSchools(dc: DataConnect, vars?: ListSharedVendorSchoolsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;

interface ListSharedVendorSchoolsRef {
  ...
  (dc: DataConnect, vars?: ListSharedVendorSchoolsVariables): QueryRef<ListSharedVendorSchoolsData, ListSharedVendorSchoolsVariables>;
}
export const listSharedVendorSchoolsRef: ListSharedVendorSchoolsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedVendorSchoolsRef:
```typescript
const name = listSharedVendorSchoolsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedVendorSchools` query has an optional argument of type `ListSharedVendorSchoolsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedVendorSchoolsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedVendorSchools` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedVendorSchoolsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSharedVendorSchoolsData {
  sharedVendorSchools: ({
    vendorCode: string;
    schoolCode: string;
    syncedAt: TimestampString;
  } & SharedVendorSchool_Key)[];
}
```
### Using `ListSharedVendorSchools`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedVendorSchools, ListSharedVendorSchoolsVariables } from '@dataconnect/generated';

// The `ListSharedVendorSchools` query has an optional argument of type `ListSharedVendorSchoolsVariables`:
const listSharedVendorSchoolsVars: ListSharedVendorSchoolsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedVendorSchools()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedVendorSchools(listSharedVendorSchoolsVars);
// Variables can be defined inline as well.
const { data } = await listSharedVendorSchools({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedVendorSchoolsVariables` argument.
const { data } = await listSharedVendorSchools();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedVendorSchools(dataConnect, listSharedVendorSchoolsVars);

console.log(data.sharedVendorSchools);

// Or, you can use the `Promise` API.
listSharedVendorSchools(listSharedVendorSchoolsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedVendorSchools);
});
```

### Using `ListSharedVendorSchools`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedVendorSchoolsRef, ListSharedVendorSchoolsVariables } from '@dataconnect/generated';

// The `ListSharedVendorSchools` query has an optional argument of type `ListSharedVendorSchoolsVariables`:
const listSharedVendorSchoolsVars: ListSharedVendorSchoolsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedVendorSchoolsRef()` function to get a reference to the query.
const ref = listSharedVendorSchoolsRef(listSharedVendorSchoolsVars);
// Variables can be defined inline as well.
const ref = listSharedVendorSchoolsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedVendorSchoolsVariables` argument.
const ref = listSharedVendorSchoolsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedVendorSchoolsRef(dataConnect, listSharedVendorSchoolsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedVendorSchools);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedVendorSchools);
});
```

## ListSharedPtCodeUsageHistory
You can execute the `ListSharedPtCodeUsageHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedPtCodeUsageHistory(vars?: ListSharedPtCodeUsageHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPtCodeUsageHistoryData, ListSharedPtCodeUsageHistoryVariables>;

interface ListSharedPtCodeUsageHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedPtCodeUsageHistoryVariables): QueryRef<ListSharedPtCodeUsageHistoryData, ListSharedPtCodeUsageHistoryVariables>;
}
export const listSharedPtCodeUsageHistoryRef: ListSharedPtCodeUsageHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedPtCodeUsageHistory(dc: DataConnect, vars?: ListSharedPtCodeUsageHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedPtCodeUsageHistoryData, ListSharedPtCodeUsageHistoryVariables>;

interface ListSharedPtCodeUsageHistoryRef {
  ...
  (dc: DataConnect, vars?: ListSharedPtCodeUsageHistoryVariables): QueryRef<ListSharedPtCodeUsageHistoryData, ListSharedPtCodeUsageHistoryVariables>;
}
export const listSharedPtCodeUsageHistoryRef: ListSharedPtCodeUsageHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedPtCodeUsageHistoryRef:
```typescript
const name = listSharedPtCodeUsageHistoryRef.operationName;
console.log(name);
```

### Variables
The `ListSharedPtCodeUsageHistory` query has an optional argument of type `ListSharedPtCodeUsageHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedPtCodeUsageHistoryVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedPtCodeUsageHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedPtCodeUsageHistoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSharedPtCodeUsageHistoryData {
  sharedPtCodeUsageHistories: ({
    ptCode: string;
    sessionYear: string;
    syncedAt: TimestampString;
  } & SharedPtCodeUsageHistory_Key)[];
}
```
### Using `ListSharedPtCodeUsageHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedPtCodeUsageHistory, ListSharedPtCodeUsageHistoryVariables } from '@dataconnect/generated';

// The `ListSharedPtCodeUsageHistory` query has an optional argument of type `ListSharedPtCodeUsageHistoryVariables`:
const listSharedPtCodeUsageHistoryVars: ListSharedPtCodeUsageHistoryVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedPtCodeUsageHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedPtCodeUsageHistory(listSharedPtCodeUsageHistoryVars);
// Variables can be defined inline as well.
const { data } = await listSharedPtCodeUsageHistory({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedPtCodeUsageHistoryVariables` argument.
const { data } = await listSharedPtCodeUsageHistory();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedPtCodeUsageHistory(dataConnect, listSharedPtCodeUsageHistoryVars);

console.log(data.sharedPtCodeUsageHistories);

// Or, you can use the `Promise` API.
listSharedPtCodeUsageHistory(listSharedPtCodeUsageHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.sharedPtCodeUsageHistories);
});
```

### Using `ListSharedPtCodeUsageHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedPtCodeUsageHistoryRef, ListSharedPtCodeUsageHistoryVariables } from '@dataconnect/generated';

// The `ListSharedPtCodeUsageHistory` query has an optional argument of type `ListSharedPtCodeUsageHistoryVariables`:
const listSharedPtCodeUsageHistoryVars: ListSharedPtCodeUsageHistoryVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedPtCodeUsageHistoryRef()` function to get a reference to the query.
const ref = listSharedPtCodeUsageHistoryRef(listSharedPtCodeUsageHistoryVars);
// Variables can be defined inline as well.
const ref = listSharedPtCodeUsageHistoryRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedPtCodeUsageHistoryVariables` argument.
const ref = listSharedPtCodeUsageHistoryRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedPtCodeUsageHistoryRef(dataConnect, listSharedPtCodeUsageHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedPtCodeUsageHistories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedPtCodeUsageHistories);
});
```

## ListSharedExecutives
You can execute the `ListSharedExecutives` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedExecutives(vars?: ListSharedExecutivesVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedExecutivesData, ListSharedExecutivesVariables>;

interface ListSharedExecutivesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedExecutivesVariables): QueryRef<ListSharedExecutivesData, ListSharedExecutivesVariables>;
}
export const listSharedExecutivesRef: ListSharedExecutivesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedExecutives(dc: DataConnect, vars?: ListSharedExecutivesVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedExecutivesData, ListSharedExecutivesVariables>;

interface ListSharedExecutivesRef {
  ...
  (dc: DataConnect, vars?: ListSharedExecutivesVariables): QueryRef<ListSharedExecutivesData, ListSharedExecutivesVariables>;
}
export const listSharedExecutivesRef: ListSharedExecutivesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedExecutivesRef:
```typescript
const name = listSharedExecutivesRef.operationName;
console.log(name);
```

### Variables
The `ListSharedExecutives` query has an optional argument of type `ListSharedExecutivesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedExecutivesVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedExecutives` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedExecutivesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSharedExecutives`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedExecutives, ListSharedExecutivesVariables } from '@dataconnect/generated';

// The `ListSharedExecutives` query has an optional argument of type `ListSharedExecutivesVariables`:
const listSharedExecutivesVars: ListSharedExecutivesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedExecutives()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedExecutives(listSharedExecutivesVars);
// Variables can be defined inline as well.
const { data } = await listSharedExecutives({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedExecutivesVariables` argument.
const { data } = await listSharedExecutives();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedExecutives(dataConnect, listSharedExecutivesVars);

console.log(data.sharedExecutives);

// Or, you can use the `Promise` API.
listSharedExecutives(listSharedExecutivesVars).then((response) => {
  const data = response.data;
  console.log(data.sharedExecutives);
});
```

### Using `ListSharedExecutives`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedExecutivesRef, ListSharedExecutivesVariables } from '@dataconnect/generated';

// The `ListSharedExecutives` query has an optional argument of type `ListSharedExecutivesVariables`:
const listSharedExecutivesVars: ListSharedExecutivesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedExecutivesRef()` function to get a reference to the query.
const ref = listSharedExecutivesRef(listSharedExecutivesVars);
// Variables can be defined inline as well.
const ref = listSharedExecutivesRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedExecutivesVariables` argument.
const ref = listSharedExecutivesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedExecutivesRef(dataConnect, listSharedExecutivesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedExecutives);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedExecutives);
});
```

## ListSharedSchoolExecutiveDefaults
You can execute the `ListSharedSchoolExecutiveDefaults` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSharedSchoolExecutiveDefaults(vars?: ListSharedSchoolExecutiveDefaultsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolExecutiveDefaultsData, ListSharedSchoolExecutiveDefaultsVariables>;

interface ListSharedSchoolExecutiveDefaultsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListSharedSchoolExecutiveDefaultsVariables): QueryRef<ListSharedSchoolExecutiveDefaultsData, ListSharedSchoolExecutiveDefaultsVariables>;
}
export const listSharedSchoolExecutiveDefaultsRef: ListSharedSchoolExecutiveDefaultsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSharedSchoolExecutiveDefaults(dc: DataConnect, vars?: ListSharedSchoolExecutiveDefaultsVariables, options?: ExecuteQueryOptions): QueryPromise<ListSharedSchoolExecutiveDefaultsData, ListSharedSchoolExecutiveDefaultsVariables>;

interface ListSharedSchoolExecutiveDefaultsRef {
  ...
  (dc: DataConnect, vars?: ListSharedSchoolExecutiveDefaultsVariables): QueryRef<ListSharedSchoolExecutiveDefaultsData, ListSharedSchoolExecutiveDefaultsVariables>;
}
export const listSharedSchoolExecutiveDefaultsRef: ListSharedSchoolExecutiveDefaultsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSharedSchoolExecutiveDefaultsRef:
```typescript
const name = listSharedSchoolExecutiveDefaultsRef.operationName;
console.log(name);
```

### Variables
The `ListSharedSchoolExecutiveDefaults` query has an optional argument of type `ListSharedSchoolExecutiveDefaultsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListSharedSchoolExecutiveDefaultsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListSharedSchoolExecutiveDefaults` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSharedSchoolExecutiveDefaultsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSharedSchoolExecutiveDefaultsData {
  sharedSchoolExecutiveDefaults: ({
    prCode: string;
    incumbentCode?: string | null;
    name: string;
    updatedAt: TimestampString;
  } & SharedSchoolExecutiveDefault_Key)[];
}
```
### Using `ListSharedSchoolExecutiveDefaults`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolExecutiveDefaults, ListSharedSchoolExecutiveDefaultsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolExecutiveDefaults` query has an optional argument of type `ListSharedSchoolExecutiveDefaultsVariables`:
const listSharedSchoolExecutiveDefaultsVars: ListSharedSchoolExecutiveDefaultsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolExecutiveDefaults()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSharedSchoolExecutiveDefaults(listSharedSchoolExecutiveDefaultsVars);
// Variables can be defined inline as well.
const { data } = await listSharedSchoolExecutiveDefaults({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolExecutiveDefaultsVariables` argument.
const { data } = await listSharedSchoolExecutiveDefaults();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSharedSchoolExecutiveDefaults(dataConnect, listSharedSchoolExecutiveDefaultsVars);

console.log(data.sharedSchoolExecutiveDefaults);

// Or, you can use the `Promise` API.
listSharedSchoolExecutiveDefaults(listSharedSchoolExecutiveDefaultsVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolExecutiveDefaults);
});
```

### Using `ListSharedSchoolExecutiveDefaults`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSharedSchoolExecutiveDefaultsRef, ListSharedSchoolExecutiveDefaultsVariables } from '@dataconnect/generated';

// The `ListSharedSchoolExecutiveDefaults` query has an optional argument of type `ListSharedSchoolExecutiveDefaultsVariables`:
const listSharedSchoolExecutiveDefaultsVars: ListSharedSchoolExecutiveDefaultsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listSharedSchoolExecutiveDefaultsRef()` function to get a reference to the query.
const ref = listSharedSchoolExecutiveDefaultsRef(listSharedSchoolExecutiveDefaultsVars);
// Variables can be defined inline as well.
const ref = listSharedSchoolExecutiveDefaultsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListSharedSchoolExecutiveDefaultsVariables` argument.
const ref = listSharedSchoolExecutiveDefaultsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSharedSchoolExecutiveDefaultsRef(dataConnect, listSharedSchoolExecutiveDefaultsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sharedSchoolExecutiveDefaults);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolExecutiveDefaults);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SetBooksellerActualDiscount
You can execute the `SetBooksellerActualDiscount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setBooksellerActualDiscount(vars: SetBooksellerActualDiscountVariables): MutationPromise<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;

interface SetBooksellerActualDiscountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetBooksellerActualDiscountVariables): MutationRef<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;
}
export const setBooksellerActualDiscountRef: SetBooksellerActualDiscountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setBooksellerActualDiscount(dc: DataConnect, vars: SetBooksellerActualDiscountVariables): MutationPromise<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;

interface SetBooksellerActualDiscountRef {
  ...
  (dc: DataConnect, vars: SetBooksellerActualDiscountVariables): MutationRef<SetBooksellerActualDiscountData, SetBooksellerActualDiscountVariables>;
}
export const setBooksellerActualDiscountRef: SetBooksellerActualDiscountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setBooksellerActualDiscountRef:
```typescript
const name = setBooksellerActualDiscountRef.operationName;
console.log(name);
```

### Variables
The `SetBooksellerActualDiscount` mutation requires an argument of type `SetBooksellerActualDiscountVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetBooksellerActualDiscountVariables {
  id: Int64String;
  actualDiscount?: string | null;
}
```
### Return Type
Recall that executing the `SetBooksellerActualDiscount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetBooksellerActualDiscountData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetBooksellerActualDiscountData {
  bookseller_updateMany: number;
}
```
### Using `SetBooksellerActualDiscount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setBooksellerActualDiscount, SetBooksellerActualDiscountVariables } from '@dataconnect/generated';

// The `SetBooksellerActualDiscount` mutation requires an argument of type `SetBooksellerActualDiscountVariables`:
const setBooksellerActualDiscountVars: SetBooksellerActualDiscountVariables = {
  id: ..., 
  actualDiscount: ..., // optional
};

// Call the `setBooksellerActualDiscount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setBooksellerActualDiscount(setBooksellerActualDiscountVars);
// Variables can be defined inline as well.
const { data } = await setBooksellerActualDiscount({ id: ..., actualDiscount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setBooksellerActualDiscount(dataConnect, setBooksellerActualDiscountVars);

console.log(data.bookseller_updateMany);

// Or, you can use the `Promise` API.
setBooksellerActualDiscount(setBooksellerActualDiscountVars).then((response) => {
  const data = response.data;
  console.log(data.bookseller_updateMany);
});
```

### Using `SetBooksellerActualDiscount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setBooksellerActualDiscountRef, SetBooksellerActualDiscountVariables } from '@dataconnect/generated';

// The `SetBooksellerActualDiscount` mutation requires an argument of type `SetBooksellerActualDiscountVariables`:
const setBooksellerActualDiscountVars: SetBooksellerActualDiscountVariables = {
  id: ..., 
  actualDiscount: ..., // optional
};

// Call the `setBooksellerActualDiscountRef()` function to get a reference to the mutation.
const ref = setBooksellerActualDiscountRef(setBooksellerActualDiscountVars);
// Variables can be defined inline as well.
const ref = setBooksellerActualDiscountRef({ id: ..., actualDiscount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setBooksellerActualDiscountRef(dataConnect, setBooksellerActualDiscountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.bookseller_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.bookseller_updateMany);
});
```

## UpsertChristianGroup
You can execute the `UpsertChristianGroup` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertChristianGroup(vars: UpsertChristianGroupVariables): MutationPromise<UpsertChristianGroupData, UpsertChristianGroupVariables>;

interface UpsertChristianGroupRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertChristianGroupVariables): MutationRef<UpsertChristianGroupData, UpsertChristianGroupVariables>;
}
export const upsertChristianGroupRef: UpsertChristianGroupRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertChristianGroup(dc: DataConnect, vars: UpsertChristianGroupVariables): MutationPromise<UpsertChristianGroupData, UpsertChristianGroupVariables>;

interface UpsertChristianGroupRef {
  ...
  (dc: DataConnect, vars: UpsertChristianGroupVariables): MutationRef<UpsertChristianGroupData, UpsertChristianGroupVariables>;
}
export const upsertChristianGroupRef: UpsertChristianGroupRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertChristianGroupRef:
```typescript
const name = upsertChristianGroupRef.operationName;
console.log(name);
```

### Variables
The `UpsertChristianGroup` mutation requires an argument of type `UpsertChristianGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertChristianGroup` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertChristianGroupData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertChristianGroupData {
  sharedChristianGroup_upsert: SharedChristianGroup_Key;
}
```
### Using `UpsertChristianGroup`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertChristianGroup, UpsertChristianGroupVariables } from '@dataconnect/generated';

// The `UpsertChristianGroup` mutation requires an argument of type `UpsertChristianGroupVariables`:
const upsertChristianGroupVars: UpsertChristianGroupVariables = {
  groupCode: ..., 
  organisationName: ..., 
  religionDenomination: ..., // optional
  category: ..., // optional
  geographyType: ..., // optional
  operationalAreas: ..., // optional
  locationDistrict: ..., // optional
  locationState: ..., // optional
  pinCode: ..., // optional
  address: ..., // optional
  phoneEmail: ..., // optional
  runsSchools: ..., // optional
  totalSchools: ..., // optional
  totalStudents: ..., // optional
  centralizedDecision: ..., // optional
  website: ..., // optional
  active: ..., 
  sourceSheetRow: ..., // optional
  sourceHash: ..., // optional
};

// Call the `upsertChristianGroup()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertChristianGroup(upsertChristianGroupVars);
// Variables can be defined inline as well.
const { data } = await upsertChristianGroup({ groupCode: ..., organisationName: ..., religionDenomination: ..., category: ..., geographyType: ..., operationalAreas: ..., locationDistrict: ..., locationState: ..., pinCode: ..., address: ..., phoneEmail: ..., runsSchools: ..., totalSchools: ..., totalStudents: ..., centralizedDecision: ..., website: ..., active: ..., sourceSheetRow: ..., sourceHash: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertChristianGroup(dataConnect, upsertChristianGroupVars);

console.log(data.sharedChristianGroup_upsert);

// Or, you can use the `Promise` API.
upsertChristianGroup(upsertChristianGroupVars).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroup_upsert);
});
```

### Using `UpsertChristianGroup`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertChristianGroupRef, UpsertChristianGroupVariables } from '@dataconnect/generated';

// The `UpsertChristianGroup` mutation requires an argument of type `UpsertChristianGroupVariables`:
const upsertChristianGroupVars: UpsertChristianGroupVariables = {
  groupCode: ..., 
  organisationName: ..., 
  religionDenomination: ..., // optional
  category: ..., // optional
  geographyType: ..., // optional
  operationalAreas: ..., // optional
  locationDistrict: ..., // optional
  locationState: ..., // optional
  pinCode: ..., // optional
  address: ..., // optional
  phoneEmail: ..., // optional
  runsSchools: ..., // optional
  totalSchools: ..., // optional
  totalStudents: ..., // optional
  centralizedDecision: ..., // optional
  website: ..., // optional
  active: ..., 
  sourceSheetRow: ..., // optional
  sourceHash: ..., // optional
};

// Call the `upsertChristianGroupRef()` function to get a reference to the mutation.
const ref = upsertChristianGroupRef(upsertChristianGroupVars);
// Variables can be defined inline as well.
const ref = upsertChristianGroupRef({ groupCode: ..., organisationName: ..., religionDenomination: ..., category: ..., geographyType: ..., operationalAreas: ..., locationDistrict: ..., locationState: ..., pinCode: ..., address: ..., phoneEmail: ..., runsSchools: ..., totalSchools: ..., totalStudents: ..., centralizedDecision: ..., website: ..., active: ..., sourceSheetRow: ..., sourceHash: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertChristianGroupRef(dataConnect, upsertChristianGroupVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedChristianGroup_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroup_upsert);
});
```

## SetChristianGroupActive
You can execute the `SetChristianGroupActive` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setChristianGroupActive(vars: SetChristianGroupActiveVariables): MutationPromise<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;

interface SetChristianGroupActiveRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetChristianGroupActiveVariables): MutationRef<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
}
export const setChristianGroupActiveRef: SetChristianGroupActiveRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setChristianGroupActive(dc: DataConnect, vars: SetChristianGroupActiveVariables): MutationPromise<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;

interface SetChristianGroupActiveRef {
  ...
  (dc: DataConnect, vars: SetChristianGroupActiveVariables): MutationRef<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
}
export const setChristianGroupActiveRef: SetChristianGroupActiveRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setChristianGroupActiveRef:
```typescript
const name = setChristianGroupActiveRef.operationName;
console.log(name);
```

### Variables
The `SetChristianGroupActive` mutation requires an argument of type `SetChristianGroupActiveVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetChristianGroupActiveVariables {
  groupCode: string;
  active: boolean;
}
```
### Return Type
Recall that executing the `SetChristianGroupActive` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetChristianGroupActiveData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetChristianGroupActiveData {
  sharedChristianGroup_update?: SharedChristianGroup_Key | null;
}
```
### Using `SetChristianGroupActive`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setChristianGroupActive, SetChristianGroupActiveVariables } from '@dataconnect/generated';

// The `SetChristianGroupActive` mutation requires an argument of type `SetChristianGroupActiveVariables`:
const setChristianGroupActiveVars: SetChristianGroupActiveVariables = {
  groupCode: ..., 
  active: ..., 
};

// Call the `setChristianGroupActive()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setChristianGroupActive(setChristianGroupActiveVars);
// Variables can be defined inline as well.
const { data } = await setChristianGroupActive({ groupCode: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setChristianGroupActive(dataConnect, setChristianGroupActiveVars);

console.log(data.sharedChristianGroup_update);

// Or, you can use the `Promise` API.
setChristianGroupActive(setChristianGroupActiveVars).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroup_update);
});
```

### Using `SetChristianGroupActive`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setChristianGroupActiveRef, SetChristianGroupActiveVariables } from '@dataconnect/generated';

// The `SetChristianGroupActive` mutation requires an argument of type `SetChristianGroupActiveVariables`:
const setChristianGroupActiveVars: SetChristianGroupActiveVariables = {
  groupCode: ..., 
  active: ..., 
};

// Call the `setChristianGroupActiveRef()` function to get a reference to the mutation.
const ref = setChristianGroupActiveRef(setChristianGroupActiveVars);
// Variables can be defined inline as well.
const ref = setChristianGroupActiveRef({ groupCode: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setChristianGroupActiveRef(dataConnect, setChristianGroupActiveVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedChristianGroup_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedChristianGroup_update);
});
```

## UpsertPreBookseller
You can execute the `UpsertPreBookseller` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertPreBookseller(vars: UpsertPreBooksellerVariables): MutationPromise<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;

interface UpsertPreBooksellerRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPreBooksellerVariables): MutationRef<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
}
export const upsertPreBooksellerRef: UpsertPreBooksellerRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertPreBookseller(dc: DataConnect, vars: UpsertPreBooksellerVariables): MutationPromise<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;

interface UpsertPreBooksellerRef {
  ...
  (dc: DataConnect, vars: UpsertPreBooksellerVariables): MutationRef<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
}
export const upsertPreBooksellerRef: UpsertPreBooksellerRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertPreBooksellerRef:
```typescript
const name = upsertPreBooksellerRef.operationName;
console.log(name);
```

### Variables
The `UpsertPreBookseller` mutation requires an argument of type `UpsertPreBooksellerVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertPreBookseller` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertPreBooksellerData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertPreBooksellerData {
  sharedPreBookseller_upsert: SharedPreBookseller_Key;
}
```
### Using `UpsertPreBookseller`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertPreBookseller, UpsertPreBooksellerVariables } from '@dataconnect/generated';

// The `UpsertPreBookseller` mutation requires an argument of type `UpsertPreBooksellerVariables`:
const upsertPreBooksellerVars: UpsertPreBooksellerVariables = {
  pbsCode: ..., 
  sourceBsCode: ..., // optional
  vendorName: ..., 
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pinCode: ..., // optional
  contactPerson: ..., // optional
  email: ..., // optional
  taxId: ..., // optional
  schoolDealCount: ..., // optional
  approximateStrength: ..., // optional
  groupSchoolCount: ..., // optional
  committedDiscount: ..., // optional
  transportCollaboration: ..., // optional
  bookingStation: ..., // optional
  vendorType: ..., // optional
  paymentStatus: ..., // optional
  conversionStatus: ..., 
  assignedBsCode: ..., // optional
  convertedAt: ..., // optional
};

// Call the `upsertPreBookseller()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertPreBookseller(upsertPreBooksellerVars);
// Variables can be defined inline as well.
const { data } = await upsertPreBookseller({ pbsCode: ..., sourceBsCode: ..., vendorName: ..., address: ..., district: ..., state: ..., pinCode: ..., contactPerson: ..., email: ..., taxId: ..., schoolDealCount: ..., approximateStrength: ..., groupSchoolCount: ..., committedDiscount: ..., transportCollaboration: ..., bookingStation: ..., vendorType: ..., paymentStatus: ..., conversionStatus: ..., assignedBsCode: ..., convertedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertPreBookseller(dataConnect, upsertPreBooksellerVars);

console.log(data.sharedPreBookseller_upsert);

// Or, you can use the `Promise` API.
upsertPreBookseller(upsertPreBooksellerVars).then((response) => {
  const data = response.data;
  console.log(data.sharedPreBookseller_upsert);
});
```

### Using `UpsertPreBookseller`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertPreBooksellerRef, UpsertPreBooksellerVariables } from '@dataconnect/generated';

// The `UpsertPreBookseller` mutation requires an argument of type `UpsertPreBooksellerVariables`:
const upsertPreBooksellerVars: UpsertPreBooksellerVariables = {
  pbsCode: ..., 
  sourceBsCode: ..., // optional
  vendorName: ..., 
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pinCode: ..., // optional
  contactPerson: ..., // optional
  email: ..., // optional
  taxId: ..., // optional
  schoolDealCount: ..., // optional
  approximateStrength: ..., // optional
  groupSchoolCount: ..., // optional
  committedDiscount: ..., // optional
  transportCollaboration: ..., // optional
  bookingStation: ..., // optional
  vendorType: ..., // optional
  paymentStatus: ..., // optional
  conversionStatus: ..., 
  assignedBsCode: ..., // optional
  convertedAt: ..., // optional
};

// Call the `upsertPreBooksellerRef()` function to get a reference to the mutation.
const ref = upsertPreBooksellerRef(upsertPreBooksellerVars);
// Variables can be defined inline as well.
const ref = upsertPreBooksellerRef({ pbsCode: ..., sourceBsCode: ..., vendorName: ..., address: ..., district: ..., state: ..., pinCode: ..., contactPerson: ..., email: ..., taxId: ..., schoolDealCount: ..., approximateStrength: ..., groupSchoolCount: ..., committedDiscount: ..., transportCollaboration: ..., bookingStation: ..., vendorType: ..., paymentStatus: ..., conversionStatus: ..., assignedBsCode: ..., convertedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertPreBooksellerRef(dataConnect, upsertPreBooksellerVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedPreBookseller_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedPreBookseller_upsert);
});
```

## UpsertSharedSchoolGroup
You can execute the `UpsertSharedSchoolGroup` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedSchoolGroup(vars: UpsertSharedSchoolGroupVariables): MutationPromise<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;

interface UpsertSharedSchoolGroupRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedSchoolGroupVariables): MutationRef<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;
}
export const upsertSharedSchoolGroupRef: UpsertSharedSchoolGroupRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedSchoolGroup(dc: DataConnect, vars: UpsertSharedSchoolGroupVariables): MutationPromise<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;

interface UpsertSharedSchoolGroupRef {
  ...
  (dc: DataConnect, vars: UpsertSharedSchoolGroupVariables): MutationRef<UpsertSharedSchoolGroupData, UpsertSharedSchoolGroupVariables>;
}
export const upsertSharedSchoolGroupRef: UpsertSharedSchoolGroupRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedSchoolGroupRef:
```typescript
const name = upsertSharedSchoolGroupRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedSchoolGroup` mutation requires an argument of type `UpsertSharedSchoolGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedSchoolGroupVariables {
  id: Int64String;
  groupCode: string;
  groupName: string;
  active: boolean;
}
```
### Return Type
Recall that executing the `UpsertSharedSchoolGroup` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedSchoolGroupData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedSchoolGroupData {
  sharedSchoolGroup_upsert: SharedSchoolGroup_Key;
}
```
### Using `UpsertSharedSchoolGroup`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolGroup, UpsertSharedSchoolGroupVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolGroup` mutation requires an argument of type `UpsertSharedSchoolGroupVariables`:
const upsertSharedSchoolGroupVars: UpsertSharedSchoolGroupVariables = {
  id: ..., 
  groupCode: ..., 
  groupName: ..., 
  active: ..., 
};

// Call the `upsertSharedSchoolGroup()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedSchoolGroup(upsertSharedSchoolGroupVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedSchoolGroup({ id: ..., groupCode: ..., groupName: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedSchoolGroup(dataConnect, upsertSharedSchoolGroupVars);

console.log(data.sharedSchoolGroup_upsert);

// Or, you can use the `Promise` API.
upsertSharedSchoolGroup(upsertSharedSchoolGroupVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroup_upsert);
});
```

### Using `UpsertSharedSchoolGroup`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolGroupRef, UpsertSharedSchoolGroupVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolGroup` mutation requires an argument of type `UpsertSharedSchoolGroupVariables`:
const upsertSharedSchoolGroupVars: UpsertSharedSchoolGroupVariables = {
  id: ..., 
  groupCode: ..., 
  groupName: ..., 
  active: ..., 
};

// Call the `upsertSharedSchoolGroupRef()` function to get a reference to the mutation.
const ref = upsertSharedSchoolGroupRef(upsertSharedSchoolGroupVars);
// Variables can be defined inline as well.
const ref = upsertSharedSchoolGroupRef({ id: ..., groupCode: ..., groupName: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedSchoolGroupRef(dataConnect, upsertSharedSchoolGroupVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedSchoolGroup_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroup_upsert);
});
```

## UpsertSharedSchoolGroupLocation
You can execute the `UpsertSharedSchoolGroupLocation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedSchoolGroupLocation(vars: UpsertSharedSchoolGroupLocationVariables): MutationPromise<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;

interface UpsertSharedSchoolGroupLocationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedSchoolGroupLocationVariables): MutationRef<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;
}
export const upsertSharedSchoolGroupLocationRef: UpsertSharedSchoolGroupLocationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedSchoolGroupLocation(dc: DataConnect, vars: UpsertSharedSchoolGroupLocationVariables): MutationPromise<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;

interface UpsertSharedSchoolGroupLocationRef {
  ...
  (dc: DataConnect, vars: UpsertSharedSchoolGroupLocationVariables): MutationRef<UpsertSharedSchoolGroupLocationData, UpsertSharedSchoolGroupLocationVariables>;
}
export const upsertSharedSchoolGroupLocationRef: UpsertSharedSchoolGroupLocationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedSchoolGroupLocationRef:
```typescript
const name = upsertSharedSchoolGroupLocationRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedSchoolGroupLocation` mutation requires an argument of type `UpsertSharedSchoolGroupLocationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertSharedSchoolGroupLocation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedSchoolGroupLocationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedSchoolGroupLocationData {
  sharedSchoolGroupLocation_upsert: SharedSchoolGroupLocation_Key;
}
```
### Using `UpsertSharedSchoolGroupLocation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolGroupLocation, UpsertSharedSchoolGroupLocationVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolGroupLocation` mutation requires an argument of type `UpsertSharedSchoolGroupLocationVariables`:
const upsertSharedSchoolGroupLocationVars: UpsertSharedSchoolGroupLocationVariables = {
  id: ..., 
  groupCode: ..., 
  subCode: ..., 
  name: ..., 
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pincode: ..., // optional
  centralizedDecision: ..., // optional
};

// Call the `upsertSharedSchoolGroupLocation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedSchoolGroupLocation(upsertSharedSchoolGroupLocationVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedSchoolGroupLocation({ id: ..., groupCode: ..., subCode: ..., name: ..., address: ..., district: ..., state: ..., pincode: ..., centralizedDecision: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedSchoolGroupLocation(dataConnect, upsertSharedSchoolGroupLocationVars);

console.log(data.sharedSchoolGroupLocation_upsert);

// Or, you can use the `Promise` API.
upsertSharedSchoolGroupLocation(upsertSharedSchoolGroupLocationVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroupLocation_upsert);
});
```

### Using `UpsertSharedSchoolGroupLocation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolGroupLocationRef, UpsertSharedSchoolGroupLocationVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolGroupLocation` mutation requires an argument of type `UpsertSharedSchoolGroupLocationVariables`:
const upsertSharedSchoolGroupLocationVars: UpsertSharedSchoolGroupLocationVariables = {
  id: ..., 
  groupCode: ..., 
  subCode: ..., 
  name: ..., 
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pincode: ..., // optional
  centralizedDecision: ..., // optional
};

// Call the `upsertSharedSchoolGroupLocationRef()` function to get a reference to the mutation.
const ref = upsertSharedSchoolGroupLocationRef(upsertSharedSchoolGroupLocationVars);
// Variables can be defined inline as well.
const ref = upsertSharedSchoolGroupLocationRef({ id: ..., groupCode: ..., subCode: ..., name: ..., address: ..., district: ..., state: ..., pincode: ..., centralizedDecision: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedSchoolGroupLocationRef(dataConnect, upsertSharedSchoolGroupLocationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedSchoolGroupLocation_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolGroupLocation_upsert);
});
```

## UpsertSharedVendor
You can execute the `UpsertSharedVendor` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedVendor(vars: UpsertSharedVendorVariables): MutationPromise<UpsertSharedVendorData, UpsertSharedVendorVariables>;

interface UpsertSharedVendorRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedVendorVariables): MutationRef<UpsertSharedVendorData, UpsertSharedVendorVariables>;
}
export const upsertSharedVendorRef: UpsertSharedVendorRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedVendor(dc: DataConnect, vars: UpsertSharedVendorVariables): MutationPromise<UpsertSharedVendorData, UpsertSharedVendorVariables>;

interface UpsertSharedVendorRef {
  ...
  (dc: DataConnect, vars: UpsertSharedVendorVariables): MutationRef<UpsertSharedVendorData, UpsertSharedVendorVariables>;
}
export const upsertSharedVendorRef: UpsertSharedVendorRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedVendorRef:
```typescript
const name = upsertSharedVendorRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedVendor` mutation requires an argument of type `UpsertSharedVendorVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertSharedVendor` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedVendorData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedVendorData {
  sharedVendor_upsert: SharedVendor_Key;
}
```
### Using `UpsertSharedVendor`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedVendor, UpsertSharedVendorVariables } from '@dataconnect/generated';

// The `UpsertSharedVendor` mutation requires an argument of type `UpsertSharedVendorVariables`:
const upsertSharedVendorVars: UpsertSharedVendorVariables = {
  vendorCode: ..., 
  preVendorCode: ..., // optional
  booksellerCode: ..., // optional
  vendorName: ..., 
  vendorType: ..., // optional
  vendorRating: ..., // optional
  actualDiscount: ..., // optional
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pinCode: ..., // optional
  contactPerson: ..., // optional
  phone: ..., // optional
  email: ..., // optional
  taxId: ..., // optional
  paymentStatus: ..., // optional
};

// Call the `upsertSharedVendor()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedVendor(upsertSharedVendorVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedVendor({ vendorCode: ..., preVendorCode: ..., booksellerCode: ..., vendorName: ..., vendorType: ..., vendorRating: ..., actualDiscount: ..., address: ..., district: ..., state: ..., pinCode: ..., contactPerson: ..., phone: ..., email: ..., taxId: ..., paymentStatus: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedVendor(dataConnect, upsertSharedVendorVars);

console.log(data.sharedVendor_upsert);

// Or, you can use the `Promise` API.
upsertSharedVendor(upsertSharedVendorVars).then((response) => {
  const data = response.data;
  console.log(data.sharedVendor_upsert);
});
```

### Using `UpsertSharedVendor`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedVendorRef, UpsertSharedVendorVariables } from '@dataconnect/generated';

// The `UpsertSharedVendor` mutation requires an argument of type `UpsertSharedVendorVariables`:
const upsertSharedVendorVars: UpsertSharedVendorVariables = {
  vendorCode: ..., 
  preVendorCode: ..., // optional
  booksellerCode: ..., // optional
  vendorName: ..., 
  vendorType: ..., // optional
  vendorRating: ..., // optional
  actualDiscount: ..., // optional
  address: ..., // optional
  district: ..., // optional
  state: ..., // optional
  pinCode: ..., // optional
  contactPerson: ..., // optional
  phone: ..., // optional
  email: ..., // optional
  taxId: ..., // optional
  paymentStatus: ..., // optional
};

// Call the `upsertSharedVendorRef()` function to get a reference to the mutation.
const ref = upsertSharedVendorRef(upsertSharedVendorVars);
// Variables can be defined inline as well.
const ref = upsertSharedVendorRef({ vendorCode: ..., preVendorCode: ..., booksellerCode: ..., vendorName: ..., vendorType: ..., vendorRating: ..., actualDiscount: ..., address: ..., district: ..., state: ..., pinCode: ..., contactPerson: ..., phone: ..., email: ..., taxId: ..., paymentStatus: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedVendorRef(dataConnect, upsertSharedVendorVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedVendor_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedVendor_upsert);
});
```

## UpsertSharedVendorSchool
You can execute the `UpsertSharedVendorSchool` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedVendorSchool(vars: UpsertSharedVendorSchoolVariables): MutationPromise<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;

interface UpsertSharedVendorSchoolRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedVendorSchoolVariables): MutationRef<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;
}
export const upsertSharedVendorSchoolRef: UpsertSharedVendorSchoolRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedVendorSchool(dc: DataConnect, vars: UpsertSharedVendorSchoolVariables): MutationPromise<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;

interface UpsertSharedVendorSchoolRef {
  ...
  (dc: DataConnect, vars: UpsertSharedVendorSchoolVariables): MutationRef<UpsertSharedVendorSchoolData, UpsertSharedVendorSchoolVariables>;
}
export const upsertSharedVendorSchoolRef: UpsertSharedVendorSchoolRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedVendorSchoolRef:
```typescript
const name = upsertSharedVendorSchoolRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedVendorSchool` mutation requires an argument of type `UpsertSharedVendorSchoolVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedVendorSchoolVariables {
  vendorCode: string;
  schoolCode: string;
}
```
### Return Type
Recall that executing the `UpsertSharedVendorSchool` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedVendorSchoolData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedVendorSchoolData {
  sharedVendorSchool_upsert: SharedVendorSchool_Key;
}
```
### Using `UpsertSharedVendorSchool`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedVendorSchool, UpsertSharedVendorSchoolVariables } from '@dataconnect/generated';

// The `UpsertSharedVendorSchool` mutation requires an argument of type `UpsertSharedVendorSchoolVariables`:
const upsertSharedVendorSchoolVars: UpsertSharedVendorSchoolVariables = {
  vendorCode: ..., 
  schoolCode: ..., 
};

// Call the `upsertSharedVendorSchool()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedVendorSchool(upsertSharedVendorSchoolVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedVendorSchool({ vendorCode: ..., schoolCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedVendorSchool(dataConnect, upsertSharedVendorSchoolVars);

console.log(data.sharedVendorSchool_upsert);

// Or, you can use the `Promise` API.
upsertSharedVendorSchool(upsertSharedVendorSchoolVars).then((response) => {
  const data = response.data;
  console.log(data.sharedVendorSchool_upsert);
});
```

### Using `UpsertSharedVendorSchool`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedVendorSchoolRef, UpsertSharedVendorSchoolVariables } from '@dataconnect/generated';

// The `UpsertSharedVendorSchool` mutation requires an argument of type `UpsertSharedVendorSchoolVariables`:
const upsertSharedVendorSchoolVars: UpsertSharedVendorSchoolVariables = {
  vendorCode: ..., 
  schoolCode: ..., 
};

// Call the `upsertSharedVendorSchoolRef()` function to get a reference to the mutation.
const ref = upsertSharedVendorSchoolRef(upsertSharedVendorSchoolVars);
// Variables can be defined inline as well.
const ref = upsertSharedVendorSchoolRef({ vendorCode: ..., schoolCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedVendorSchoolRef(dataConnect, upsertSharedVendorSchoolVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedVendorSchool_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedVendorSchool_upsert);
});
```

## UpsertSharedPtCodeUsageHistory
You can execute the `UpsertSharedPtCodeUsageHistory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedPtCodeUsageHistory(vars: UpsertSharedPtCodeUsageHistoryVariables): MutationPromise<UpsertSharedPtCodeUsageHistoryData, UpsertSharedPtCodeUsageHistoryVariables>;

interface UpsertSharedPtCodeUsageHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedPtCodeUsageHistoryVariables): MutationRef<UpsertSharedPtCodeUsageHistoryData, UpsertSharedPtCodeUsageHistoryVariables>;
}
export const upsertSharedPtCodeUsageHistoryRef: UpsertSharedPtCodeUsageHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedPtCodeUsageHistory(dc: DataConnect, vars: UpsertSharedPtCodeUsageHistoryVariables): MutationPromise<UpsertSharedPtCodeUsageHistoryData, UpsertSharedPtCodeUsageHistoryVariables>;

interface UpsertSharedPtCodeUsageHistoryRef {
  ...
  (dc: DataConnect, vars: UpsertSharedPtCodeUsageHistoryVariables): MutationRef<UpsertSharedPtCodeUsageHistoryData, UpsertSharedPtCodeUsageHistoryVariables>;
}
export const upsertSharedPtCodeUsageHistoryRef: UpsertSharedPtCodeUsageHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedPtCodeUsageHistoryRef:
```typescript
const name = upsertSharedPtCodeUsageHistoryRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedPtCodeUsageHistory` mutation requires an argument of type `UpsertSharedPtCodeUsageHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedPtCodeUsageHistoryVariables {
  ptCode: string;
  sessionYear: string;
}
```
### Return Type
Recall that executing the `UpsertSharedPtCodeUsageHistory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedPtCodeUsageHistoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedPtCodeUsageHistoryData {
  sharedPtCodeUsageHistory_upsert: SharedPtCodeUsageHistory_Key;
}
```
### Using `UpsertSharedPtCodeUsageHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedPtCodeUsageHistory, UpsertSharedPtCodeUsageHistoryVariables } from '@dataconnect/generated';

// The `UpsertSharedPtCodeUsageHistory` mutation requires an argument of type `UpsertSharedPtCodeUsageHistoryVariables`:
const upsertSharedPtCodeUsageHistoryVars: UpsertSharedPtCodeUsageHistoryVariables = {
  ptCode: ..., 
  sessionYear: ..., 
};

// Call the `upsertSharedPtCodeUsageHistory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedPtCodeUsageHistory(upsertSharedPtCodeUsageHistoryVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedPtCodeUsageHistory({ ptCode: ..., sessionYear: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedPtCodeUsageHistory(dataConnect, upsertSharedPtCodeUsageHistoryVars);

console.log(data.sharedPtCodeUsageHistory_upsert);

// Or, you can use the `Promise` API.
upsertSharedPtCodeUsageHistory(upsertSharedPtCodeUsageHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.sharedPtCodeUsageHistory_upsert);
});
```

### Using `UpsertSharedPtCodeUsageHistory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedPtCodeUsageHistoryRef, UpsertSharedPtCodeUsageHistoryVariables } from '@dataconnect/generated';

// The `UpsertSharedPtCodeUsageHistory` mutation requires an argument of type `UpsertSharedPtCodeUsageHistoryVariables`:
const upsertSharedPtCodeUsageHistoryVars: UpsertSharedPtCodeUsageHistoryVariables = {
  ptCode: ..., 
  sessionYear: ..., 
};

// Call the `upsertSharedPtCodeUsageHistoryRef()` function to get a reference to the mutation.
const ref = upsertSharedPtCodeUsageHistoryRef(upsertSharedPtCodeUsageHistoryVars);
// Variables can be defined inline as well.
const ref = upsertSharedPtCodeUsageHistoryRef({ ptCode: ..., sessionYear: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedPtCodeUsageHistoryRef(dataConnect, upsertSharedPtCodeUsageHistoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedPtCodeUsageHistory_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedPtCodeUsageHistory_upsert);
});
```

## UpsertSharedExecutive
You can execute the `UpsertSharedExecutive` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedExecutive(vars: UpsertSharedExecutiveVariables): MutationPromise<UpsertSharedExecutiveData, UpsertSharedExecutiveVariables>;

interface UpsertSharedExecutiveRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedExecutiveVariables): MutationRef<UpsertSharedExecutiveData, UpsertSharedExecutiveVariables>;
}
export const upsertSharedExecutiveRef: UpsertSharedExecutiveRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedExecutive(dc: DataConnect, vars: UpsertSharedExecutiveVariables): MutationPromise<UpsertSharedExecutiveData, UpsertSharedExecutiveVariables>;

interface UpsertSharedExecutiveRef {
  ...
  (dc: DataConnect, vars: UpsertSharedExecutiveVariables): MutationRef<UpsertSharedExecutiveData, UpsertSharedExecutiveVariables>;
}
export const upsertSharedExecutiveRef: UpsertSharedExecutiveRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedExecutiveRef:
```typescript
const name = upsertSharedExecutiveRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedExecutive` mutation requires an argument of type `UpsertSharedExecutiveVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedExecutiveVariables {
  incumbentCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
  baseLocation?: string | null;
}
```
### Return Type
Recall that executing the `UpsertSharedExecutive` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedExecutiveData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedExecutiveData {
  sharedExecutive_upsert: SharedExecutive_Key;
}
```
### Using `UpsertSharedExecutive`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedExecutive, UpsertSharedExecutiveVariables } from '@dataconnect/generated';

// The `UpsertSharedExecutive` mutation requires an argument of type `UpsertSharedExecutiveVariables`:
const upsertSharedExecutiveVars: UpsertSharedExecutiveVariables = {
  incumbentCode: ..., 
  name: ..., 
  mobile: ..., // optional
  email: ..., // optional
  baseLocation: ..., // optional
};

// Call the `upsertSharedExecutive()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedExecutive(upsertSharedExecutiveVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedExecutive({ incumbentCode: ..., name: ..., mobile: ..., email: ..., baseLocation: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedExecutive(dataConnect, upsertSharedExecutiveVars);

console.log(data.sharedExecutive_upsert);

// Or, you can use the `Promise` API.
upsertSharedExecutive(upsertSharedExecutiveVars).then((response) => {
  const data = response.data;
  console.log(data.sharedExecutive_upsert);
});
```

### Using `UpsertSharedExecutive`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedExecutiveRef, UpsertSharedExecutiveVariables } from '@dataconnect/generated';

// The `UpsertSharedExecutive` mutation requires an argument of type `UpsertSharedExecutiveVariables`:
const upsertSharedExecutiveVars: UpsertSharedExecutiveVariables = {
  incumbentCode: ..., 
  name: ..., 
  mobile: ..., // optional
  email: ..., // optional
  baseLocation: ..., // optional
};

// Call the `upsertSharedExecutiveRef()` function to get a reference to the mutation.
const ref = upsertSharedExecutiveRef(upsertSharedExecutiveVars);
// Variables can be defined inline as well.
const ref = upsertSharedExecutiveRef({ incumbentCode: ..., name: ..., mobile: ..., email: ..., baseLocation: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedExecutiveRef(dataConnect, upsertSharedExecutiveVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedExecutive_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedExecutive_upsert);
});
```

## UpsertSharedSchoolExecutiveDefault
You can execute the `UpsertSharedSchoolExecutiveDefault` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedSchoolExecutiveDefault(vars: UpsertSharedSchoolExecutiveDefaultVariables): MutationPromise<UpsertSharedSchoolExecutiveDefaultData, UpsertSharedSchoolExecutiveDefaultVariables>;

interface UpsertSharedSchoolExecutiveDefaultRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedSchoolExecutiveDefaultVariables): MutationRef<UpsertSharedSchoolExecutiveDefaultData, UpsertSharedSchoolExecutiveDefaultVariables>;
}
export const upsertSharedSchoolExecutiveDefaultRef: UpsertSharedSchoolExecutiveDefaultRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedSchoolExecutiveDefault(dc: DataConnect, vars: UpsertSharedSchoolExecutiveDefaultVariables): MutationPromise<UpsertSharedSchoolExecutiveDefaultData, UpsertSharedSchoolExecutiveDefaultVariables>;

interface UpsertSharedSchoolExecutiveDefaultRef {
  ...
  (dc: DataConnect, vars: UpsertSharedSchoolExecutiveDefaultVariables): MutationRef<UpsertSharedSchoolExecutiveDefaultData, UpsertSharedSchoolExecutiveDefaultVariables>;
}
export const upsertSharedSchoolExecutiveDefaultRef: UpsertSharedSchoolExecutiveDefaultRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedSchoolExecutiveDefaultRef:
```typescript
const name = upsertSharedSchoolExecutiveDefaultRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedSchoolExecutiveDefault` mutation requires an argument of type `UpsertSharedSchoolExecutiveDefaultVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedSchoolExecutiveDefaultVariables {
  prCode: string;
  incumbentCode?: string | null;
  name: string;
}
```
### Return Type
Recall that executing the `UpsertSharedSchoolExecutiveDefault` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedSchoolExecutiveDefaultData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedSchoolExecutiveDefaultData {
  sharedSchoolExecutiveDefault_upsert: SharedSchoolExecutiveDefault_Key;
}
```
### Using `UpsertSharedSchoolExecutiveDefault`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolExecutiveDefault, UpsertSharedSchoolExecutiveDefaultVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolExecutiveDefault` mutation requires an argument of type `UpsertSharedSchoolExecutiveDefaultVariables`:
const upsertSharedSchoolExecutiveDefaultVars: UpsertSharedSchoolExecutiveDefaultVariables = {
  prCode: ..., 
  incumbentCode: ..., // optional
  name: ..., 
};

// Call the `upsertSharedSchoolExecutiveDefault()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedSchoolExecutiveDefault(upsertSharedSchoolExecutiveDefaultVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedSchoolExecutiveDefault({ prCode: ..., incumbentCode: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedSchoolExecutiveDefault(dataConnect, upsertSharedSchoolExecutiveDefaultVars);

console.log(data.sharedSchoolExecutiveDefault_upsert);

// Or, you can use the `Promise` API.
upsertSharedSchoolExecutiveDefault(upsertSharedSchoolExecutiveDefaultVars).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolExecutiveDefault_upsert);
});
```

### Using `UpsertSharedSchoolExecutiveDefault`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedSchoolExecutiveDefaultRef, UpsertSharedSchoolExecutiveDefaultVariables } from '@dataconnect/generated';

// The `UpsertSharedSchoolExecutiveDefault` mutation requires an argument of type `UpsertSharedSchoolExecutiveDefaultVariables`:
const upsertSharedSchoolExecutiveDefaultVars: UpsertSharedSchoolExecutiveDefaultVariables = {
  prCode: ..., 
  incumbentCode: ..., // optional
  name: ..., 
};

// Call the `upsertSharedSchoolExecutiveDefaultRef()` function to get a reference to the mutation.
const ref = upsertSharedSchoolExecutiveDefaultRef(upsertSharedSchoolExecutiveDefaultVars);
// Variables can be defined inline as well.
const ref = upsertSharedSchoolExecutiveDefaultRef({ prCode: ..., incumbentCode: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedSchoolExecutiveDefaultRef(dataConnect, upsertSharedSchoolExecutiveDefaultVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedSchoolExecutiveDefault_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedSchoolExecutiveDefault_upsert);
});
```

## UpsertSharedOrderSchoolExecutive
You can execute the `UpsertSharedOrderSchoolExecutive` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertSharedOrderSchoolExecutive(vars: UpsertSharedOrderSchoolExecutiveVariables): MutationPromise<UpsertSharedOrderSchoolExecutiveData, UpsertSharedOrderSchoolExecutiveVariables>;

interface UpsertSharedOrderSchoolExecutiveRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSharedOrderSchoolExecutiveVariables): MutationRef<UpsertSharedOrderSchoolExecutiveData, UpsertSharedOrderSchoolExecutiveVariables>;
}
export const upsertSharedOrderSchoolExecutiveRef: UpsertSharedOrderSchoolExecutiveRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSharedOrderSchoolExecutive(dc: DataConnect, vars: UpsertSharedOrderSchoolExecutiveVariables): MutationPromise<UpsertSharedOrderSchoolExecutiveData, UpsertSharedOrderSchoolExecutiveVariables>;

interface UpsertSharedOrderSchoolExecutiveRef {
  ...
  (dc: DataConnect, vars: UpsertSharedOrderSchoolExecutiveVariables): MutationRef<UpsertSharedOrderSchoolExecutiveData, UpsertSharedOrderSchoolExecutiveVariables>;
}
export const upsertSharedOrderSchoolExecutiveRef: UpsertSharedOrderSchoolExecutiveRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSharedOrderSchoolExecutiveRef:
```typescript
const name = upsertSharedOrderSchoolExecutiveRef.operationName;
console.log(name);
```

### Variables
The `UpsertSharedOrderSchoolExecutive` mutation requires an argument of type `UpsertSharedOrderSchoolExecutiveVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSharedOrderSchoolExecutiveVariables {
  orderSheet1Id: number;
  schoolCode: string;
  incumbentCode?: string | null;
  name: string;
}
```
### Return Type
Recall that executing the `UpsertSharedOrderSchoolExecutive` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSharedOrderSchoolExecutiveData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSharedOrderSchoolExecutiveData {
  sharedOrderSchoolExecutive_upsert: SharedOrderSchoolExecutive_Key;
}
```
### Using `UpsertSharedOrderSchoolExecutive`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSharedOrderSchoolExecutive, UpsertSharedOrderSchoolExecutiveVariables } from '@dataconnect/generated';

// The `UpsertSharedOrderSchoolExecutive` mutation requires an argument of type `UpsertSharedOrderSchoolExecutiveVariables`:
const upsertSharedOrderSchoolExecutiveVars: UpsertSharedOrderSchoolExecutiveVariables = {
  orderSheet1Id: ..., 
  schoolCode: ..., 
  incumbentCode: ..., // optional
  name: ..., 
};

// Call the `upsertSharedOrderSchoolExecutive()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSharedOrderSchoolExecutive(upsertSharedOrderSchoolExecutiveVars);
// Variables can be defined inline as well.
const { data } = await upsertSharedOrderSchoolExecutive({ orderSheet1Id: ..., schoolCode: ..., incumbentCode: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSharedOrderSchoolExecutive(dataConnect, upsertSharedOrderSchoolExecutiveVars);

console.log(data.sharedOrderSchoolExecutive_upsert);

// Or, you can use the `Promise` API.
upsertSharedOrderSchoolExecutive(upsertSharedOrderSchoolExecutiveVars).then((response) => {
  const data = response.data;
  console.log(data.sharedOrderSchoolExecutive_upsert);
});
```

### Using `UpsertSharedOrderSchoolExecutive`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSharedOrderSchoolExecutiveRef, UpsertSharedOrderSchoolExecutiveVariables } from '@dataconnect/generated';

// The `UpsertSharedOrderSchoolExecutive` mutation requires an argument of type `UpsertSharedOrderSchoolExecutiveVariables`:
const upsertSharedOrderSchoolExecutiveVars: UpsertSharedOrderSchoolExecutiveVariables = {
  orderSheet1Id: ..., 
  schoolCode: ..., 
  incumbentCode: ..., // optional
  name: ..., 
};

// Call the `upsertSharedOrderSchoolExecutiveRef()` function to get a reference to the mutation.
const ref = upsertSharedOrderSchoolExecutiveRef(upsertSharedOrderSchoolExecutiveVars);
// Variables can be defined inline as well.
const ref = upsertSharedOrderSchoolExecutiveRef({ orderSheet1Id: ..., schoolCode: ..., incumbentCode: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSharedOrderSchoolExecutiveRef(dataConnect, upsertSharedOrderSchoolExecutiveVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sharedOrderSchoolExecutive_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sharedOrderSchoolExecutive_upsert);
});
```

