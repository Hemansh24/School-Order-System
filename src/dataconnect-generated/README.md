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

# Mutations

No mutations were generated for the `example` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

