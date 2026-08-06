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
  - [*ListBooksellers*](#listbooksellers)
  - [*GetBooksellerByCode*](#getbooksellerbycode)
  - [*ListItems*](#listitems)
  - [*GetItemByCode*](#getitembycode)
  - [*ListBooksellerSchoolMapping*](#listbooksellerschoolmapping)
- [**Mutations**](#mutations)

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
listOrganisations(options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, undefined>;

interface ListOrganisationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganisationsData, undefined>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrganisations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOrganisationsData, undefined>;

interface ListOrganisationsRef {
  ...
  (dc: DataConnect): QueryRef<ListOrganisationsData, undefined>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrganisationsRef:
```typescript
const name = listOrganisationsRef.operationName;
console.log(name);
```

### Variables
The `ListOrganisations` query has no variables.
### Return Type
Recall that executing the `ListOrganisations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListOrganisations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrganisations } from '@dataconnect/generated';


// Call the `listOrganisations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrganisations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrganisations(dataConnect);

console.log(data.organisations);

// Or, you can use the `Promise` API.
listOrganisations().then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

### Using `ListOrganisations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrganisationsRef } from '@dataconnect/generated';


// Call the `listOrganisationsRef()` function to get a reference to the query.
const ref = listOrganisationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrganisationsRef(dataConnect);

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

## ListBooksellers
You can execute the `ListBooksellers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBooksellers(options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, undefined>;

interface ListBooksellersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksellersData, undefined>;
}
export const listBooksellersRef: ListBooksellersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooksellers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksellersData, undefined>;

interface ListBooksellersRef {
  ...
  (dc: DataConnect): QueryRef<ListBooksellersData, undefined>;
}
export const listBooksellersRef: ListBooksellersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksellersRef:
```typescript
const name = listBooksellersRef.operationName;
console.log(name);
```

### Variables
The `ListBooksellers` query has no variables.
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
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    vendorType?: string | null;
  } & Bookseller_Key)[];
}
```
### Using `ListBooksellers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBooksellers } from '@dataconnect/generated';


// Call the `listBooksellers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooksellers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooksellers(dataConnect);

console.log(data.booksellers);

// Or, you can use the `Promise` API.
listBooksellers().then((response) => {
  const data = response.data;
  console.log(data.booksellers);
});
```

### Using `ListBooksellers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksellersRef } from '@dataconnect/generated';


// Call the `listBooksellersRef()` function to get a reference to the query.
const ref = listBooksellersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksellersRef(dataConnect);

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
listItems(options?: ExecuteQueryOptions): QueryPromise<ListItemsData, undefined>;

interface ListItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListItemsData, undefined>;
}
export const listItemsRef: ListItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListItemsData, undefined>;

interface ListItemsRef {
  ...
  (dc: DataConnect): QueryRef<ListItemsData, undefined>;
}
export const listItemsRef: ListItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listItemsRef:
```typescript
const name = listItemsRef.operationName;
console.log(name);
```

### Variables
The `ListItems` query has no variables.
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
    languageCode?: string | null;
    mrp?: number | null;
    isbnNo?: string | null;
    obsolete?: boolean | null;
  } & Item_Key)[];
}
```
### Using `ListItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listItems } from '@dataconnect/generated';


// Call the `listItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listItems(dataConnect);

console.log(data.items);

// Or, you can use the `Promise` API.
listItems().then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `ListItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listItemsRef } from '@dataconnect/generated';


// Call the `listItemsRef()` function to get a reference to the query.
const ref = listItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listItemsRef(dataConnect);

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
listBooksellerSchoolMapping(options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, undefined>;

interface ListBooksellerSchoolMappingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksellerSchoolMappingData, undefined>;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooksellerSchoolMapping(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksellerSchoolMappingData, undefined>;

interface ListBooksellerSchoolMappingRef {
  ...
  (dc: DataConnect): QueryRef<ListBooksellerSchoolMappingData, undefined>;
}
export const listBooksellerSchoolMappingRef: ListBooksellerSchoolMappingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksellerSchoolMappingRef:
```typescript
const name = listBooksellerSchoolMappingRef.operationName;
console.log(name);
```

### Variables
The `ListBooksellerSchoolMapping` query has no variables.
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
import { connectorConfig, listBooksellerSchoolMapping } from '@dataconnect/generated';


// Call the `listBooksellerSchoolMapping()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooksellerSchoolMapping();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooksellerSchoolMapping(dataConnect);

console.log(data.booksellerSchoolMappings);

// Or, you can use the `Promise` API.
listBooksellerSchoolMapping().then((response) => {
  const data = response.data;
  console.log(data.booksellerSchoolMappings);
});
```

### Using `ListBooksellerSchoolMapping`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksellerSchoolMappingRef } from '@dataconnect/generated';


// Call the `listBooksellerSchoolMappingRef()` function to get a reference to the query.
const ref = listBooksellerSchoolMappingRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksellerSchoolMappingRef(dataConnect);

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

# Mutations

No mutations were generated for the `example` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

