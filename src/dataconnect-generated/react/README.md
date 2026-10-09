# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
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
  - [*ListSharedSchoolGroups*](#listsharedschoolgroups)
  - [*ListSharedSchoolGroupLocations*](#listsharedschoolgrouplocations)
  - [*ListSharedChristianGroups*](#listsharedchristiangroups)
  - [*ListSharedPreBooksellers*](#listsharedprebooksellers)
- [**Mutations**](#mutations)
  - [*UpsertChristianGroup*](#upsertchristiangroup)
  - [*SetChristianGroupActive*](#setchristiangroupactive)
  - [*UpsertPreBookseller*](#upsertprebookseller)

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## ListOrganisations
You can execute the `ListOrganisations` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListOrganisations(dc: DataConnect, vars?: ListOrganisationsVariables, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, ListOrganisationsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListOrganisations(vars?: ListOrganisationsVariables, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, ListOrganisationsVariables>;
```

### Variables
The `ListOrganisations` Query has an optional argument of type `ListOrganisationsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListOrganisationsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListOrganisations` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListOrganisations` Query is of type `ListOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListOrganisations`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListOrganisationsVariables } from '@dataconnect/generated';
import { useListOrganisations } from '@dataconnect/generated/react'

export default function ListOrganisationsComponent() {
  // The `useListOrganisations` Query hook has an optional argument of type `ListOrganisationsVariables`:
  const listOrganisationsVars: ListOrganisationsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListOrganisations(listOrganisationsVars);
  // Variables can be defined inline as well.
  const query = useListOrganisations({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListOrganisationsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListOrganisations();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListOrganisations(dataConnect, listOrganisationsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListOrganisations(listOrganisationsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListOrganisations(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListOrganisations(dataConnect, listOrganisationsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.organisations);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SearchOrganisations
You can execute the `SearchOrganisations` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useSearchOrganisations(dc: DataConnect, vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useSearchOrganisations(vars?: SearchOrganisationsVariables, options?: useDataConnectQueryOptions<SearchOrganisationsData>): UseDataConnectQueryResult<SearchOrganisationsData, SearchOrganisationsVariables>;
```

### Variables
The `SearchOrganisations` Query has an optional argument of type `SearchOrganisationsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `SearchOrganisations` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `SearchOrganisations` Query is of type `SearchOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `SearchOrganisations`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SearchOrganisationsVariables } from '@dataconnect/generated';
import { useSearchOrganisations } from '@dataconnect/generated/react'

export default function SearchOrganisationsComponent() {
  // The `useSearchOrganisations` Query hook has an optional argument of type `SearchOrganisationsVariables`:
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

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useSearchOrganisations(searchOrganisationsVars);
  // Variables can be defined inline as well.
  const query = useSearchOrganisations({ prCode: ..., organisationName: ..., district: ..., state: ..., actionStatus: ..., workingStatus: ..., limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `SearchOrganisationsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useSearchOrganisations();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useSearchOrganisations(dataConnect, searchOrganisationsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useSearchOrganisations(searchOrganisationsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useSearchOrganisations(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useSearchOrganisations(dataConnect, searchOrganisationsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.organisations);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetOrganisationByPrCode
You can execute the `GetOrganisationByPrCode` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetOrganisationByPrCode(dc: DataConnect, vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetOrganisationByPrCode(vars: GetOrganisationByPrCodeVariables, options?: useDataConnectQueryOptions<GetOrganisationByPrCodeData>): UseDataConnectQueryResult<GetOrganisationByPrCodeData, GetOrganisationByPrCodeVariables>;
```

### Variables
The `GetOrganisationByPrCode` Query requires an argument of type `GetOrganisationByPrCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetOrganisationByPrCodeVariables {
  prCode: string;
}
```
### Return Type
Recall that calling the `GetOrganisationByPrCode` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetOrganisationByPrCode` Query is of type `GetOrganisationByPrCodeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetOrganisationByPrCode`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetOrganisationByPrCodeVariables } from '@dataconnect/generated';
import { useGetOrganisationByPrCode } from '@dataconnect/generated/react'

export default function GetOrganisationByPrCodeComponent() {
  // The `useGetOrganisationByPrCode` Query hook requires an argument of type `GetOrganisationByPrCodeVariables`:
  const getOrganisationByPrCodeVars: GetOrganisationByPrCodeVariables = {
    prCode: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetOrganisationByPrCode(getOrganisationByPrCodeVars);
  // Variables can be defined inline as well.
  const query = useGetOrganisationByPrCode({ prCode: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetOrganisationByPrCode(dataConnect, getOrganisationByPrCodeVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetOrganisationByPrCode(getOrganisationByPrCodeVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetOrganisationByPrCode(dataConnect, getOrganisationByPrCodeVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.organisations);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListBooksellers
You can execute the `ListBooksellers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListBooksellers(dc: DataConnect, vars?: ListBooksellersVariables, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, ListBooksellersVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListBooksellers(vars?: ListBooksellersVariables, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, ListBooksellersVariables>;
```

### Variables
The `ListBooksellers` Query has an optional argument of type `ListBooksellersVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListBooksellers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListBooksellers` Query is of type `ListBooksellersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListBooksellers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListBooksellersVariables } from '@dataconnect/generated';
import { useListBooksellers } from '@dataconnect/generated/react'

export default function ListBooksellersComponent() {
  // The `useListBooksellers` Query hook has an optional argument of type `ListBooksellersVariables`:
  const listBooksellersVars: ListBooksellersVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListBooksellers(listBooksellersVars);
  // Variables can be defined inline as well.
  const query = useListBooksellers({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListBooksellersVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListBooksellers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListBooksellers(dataConnect, listBooksellersVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellers(listBooksellersVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListBooksellers(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellers(dataConnect, listBooksellersVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.booksellers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetBooksellerByCode
You can execute the `GetBooksellerByCode` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetBooksellerByCode(dc: DataConnect, vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetBooksellerByCode(vars: GetBooksellerByCodeVariables, options?: useDataConnectQueryOptions<GetBooksellerByCodeData>): UseDataConnectQueryResult<GetBooksellerByCodeData, GetBooksellerByCodeVariables>;
```

### Variables
The `GetBooksellerByCode` Query requires an argument of type `GetBooksellerByCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetBooksellerByCodeVariables {
  booksellerCode: string;
}
```
### Return Type
Recall that calling the `GetBooksellerByCode` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetBooksellerByCode` Query is of type `GetBooksellerByCodeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetBooksellerByCode`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetBooksellerByCodeVariables } from '@dataconnect/generated';
import { useGetBooksellerByCode } from '@dataconnect/generated/react'

export default function GetBooksellerByCodeComponent() {
  // The `useGetBooksellerByCode` Query hook requires an argument of type `GetBooksellerByCodeVariables`:
  const getBooksellerByCodeVars: GetBooksellerByCodeVariables = {
    booksellerCode: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetBooksellerByCode(getBooksellerByCodeVars);
  // Variables can be defined inline as well.
  const query = useGetBooksellerByCode({ booksellerCode: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetBooksellerByCode(dataConnect, getBooksellerByCodeVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetBooksellerByCode(getBooksellerByCodeVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetBooksellerByCode(dataConnect, getBooksellerByCodeVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.booksellers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListItems
You can execute the `ListItems` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListItems(dc: DataConnect, vars?: ListItemsVariables, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, ListItemsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListItems(vars?: ListItemsVariables, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, ListItemsVariables>;
```

### Variables
The `ListItems` Query has an optional argument of type `ListItemsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListItemsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListItems` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListItems` Query is of type `ListItemsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListItems`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListItemsVariables } from '@dataconnect/generated';
import { useListItems } from '@dataconnect/generated/react'

export default function ListItemsComponent() {
  // The `useListItems` Query hook has an optional argument of type `ListItemsVariables`:
  const listItemsVars: ListItemsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListItems(listItemsVars);
  // Variables can be defined inline as well.
  const query = useListItems({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListItemsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListItems();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListItems(dataConnect, listItemsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListItems(listItemsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListItems(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListItems(dataConnect, listItemsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.items);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetItemByCode
You can execute the `GetItemByCode` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetItemByCode(dc: DataConnect, vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetItemByCode(vars: GetItemByCodeVariables, options?: useDataConnectQueryOptions<GetItemByCodeData>): UseDataConnectQueryResult<GetItemByCodeData, GetItemByCodeVariables>;
```

### Variables
The `GetItemByCode` Query requires an argument of type `GetItemByCodeVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetItemByCodeVariables {
  itemCode: string;
}
```
### Return Type
Recall that calling the `GetItemByCode` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetItemByCode` Query is of type `GetItemByCodeData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetItemByCode`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetItemByCodeVariables } from '@dataconnect/generated';
import { useGetItemByCode } from '@dataconnect/generated/react'

export default function GetItemByCodeComponent() {
  // The `useGetItemByCode` Query hook requires an argument of type `GetItemByCodeVariables`:
  const getItemByCodeVars: GetItemByCodeVariables = {
    itemCode: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetItemByCode(getItemByCodeVars);
  // Variables can be defined inline as well.
  const query = useGetItemByCode({ itemCode: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetItemByCode(dataConnect, getItemByCodeVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetItemByCode(getItemByCodeVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetItemByCode(dataConnect, getItemByCodeVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.items);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListBooksellerSchoolMapping
You can execute the `ListBooksellerSchoolMapping` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListBooksellerSchoolMapping(dc: DataConnect, vars?: ListBooksellerSchoolMappingVariables, options?: useDataConnectQueryOptions<ListBooksellerSchoolMappingData>): UseDataConnectQueryResult<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListBooksellerSchoolMapping(vars?: ListBooksellerSchoolMappingVariables, options?: useDataConnectQueryOptions<ListBooksellerSchoolMappingData>): UseDataConnectQueryResult<ListBooksellerSchoolMappingData, ListBooksellerSchoolMappingVariables>;
```

### Variables
The `ListBooksellerSchoolMapping` Query has an optional argument of type `ListBooksellerSchoolMappingVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListBooksellerSchoolMappingVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListBooksellerSchoolMapping` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListBooksellerSchoolMapping` Query is of type `ListBooksellerSchoolMappingData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListBooksellerSchoolMappingData {
  booksellerSchoolMappings: ({
    id: Int64String;
    booksellerCode: string;
    booksellerSubCode?: string | null;
    ptCode: string;
  } & BooksellerSchoolMapping_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListBooksellerSchoolMapping`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListBooksellerSchoolMappingVariables } from '@dataconnect/generated';
import { useListBooksellerSchoolMapping } from '@dataconnect/generated/react'

export default function ListBooksellerSchoolMappingComponent() {
  // The `useListBooksellerSchoolMapping` Query hook has an optional argument of type `ListBooksellerSchoolMappingVariables`:
  const listBooksellerSchoolMappingVars: ListBooksellerSchoolMappingVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListBooksellerSchoolMapping(listBooksellerSchoolMappingVars);
  // Variables can be defined inline as well.
  const query = useListBooksellerSchoolMapping({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListBooksellerSchoolMappingVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListBooksellerSchoolMapping();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListBooksellerSchoolMapping(dataConnect, listBooksellerSchoolMappingVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellerSchoolMapping(listBooksellerSchoolMappingVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListBooksellerSchoolMapping(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellerSchoolMapping(dataConnect, listBooksellerSchoolMappingVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.booksellerSchoolMappings);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListSharedSchoolGroups
You can execute the `ListSharedSchoolGroups` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListSharedSchoolGroups(dc: DataConnect, vars?: ListSharedSchoolGroupsVariables, options?: useDataConnectQueryOptions<ListSharedSchoolGroupsData>): UseDataConnectQueryResult<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListSharedSchoolGroups(vars?: ListSharedSchoolGroupsVariables, options?: useDataConnectQueryOptions<ListSharedSchoolGroupsData>): UseDataConnectQueryResult<ListSharedSchoolGroupsData, ListSharedSchoolGroupsVariables>;
```

### Variables
The `ListSharedSchoolGroups` Query has an optional argument of type `ListSharedSchoolGroupsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListSharedSchoolGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListSharedSchoolGroups` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListSharedSchoolGroups` Query is of type `ListSharedSchoolGroupsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListSharedSchoolGroupsData {
  sharedSchoolGroups: ({
    groupCode: string;
    groupName: string;
    syncedAt: TimestampString;
  })[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListSharedSchoolGroups`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListSharedSchoolGroupsVariables } from '@dataconnect/generated';
import { useListSharedSchoolGroups } from '@dataconnect/generated/react'

export default function ListSharedSchoolGroupsComponent() {
  // The `useListSharedSchoolGroups` Query hook has an optional argument of type `ListSharedSchoolGroupsVariables`:
  const listSharedSchoolGroupsVars: ListSharedSchoolGroupsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListSharedSchoolGroups(listSharedSchoolGroupsVars);
  // Variables can be defined inline as well.
  const query = useListSharedSchoolGroups({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListSharedSchoolGroupsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListSharedSchoolGroups();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListSharedSchoolGroups(dataConnect, listSharedSchoolGroupsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedSchoolGroups(listSharedSchoolGroupsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListSharedSchoolGroups(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedSchoolGroups(dataConnect, listSharedSchoolGroupsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.sharedSchoolGroups);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListSharedSchoolGroupLocations
You can execute the `ListSharedSchoolGroupLocations` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListSharedSchoolGroupLocations(dc: DataConnect, vars?: ListSharedSchoolGroupLocationsVariables, options?: useDataConnectQueryOptions<ListSharedSchoolGroupLocationsData>): UseDataConnectQueryResult<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListSharedSchoolGroupLocations(vars?: ListSharedSchoolGroupLocationsVariables, options?: useDataConnectQueryOptions<ListSharedSchoolGroupLocationsData>): UseDataConnectQueryResult<ListSharedSchoolGroupLocationsData, ListSharedSchoolGroupLocationsVariables>;
```

### Variables
The `ListSharedSchoolGroupLocations` Query has an optional argument of type `ListSharedSchoolGroupLocationsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListSharedSchoolGroupLocationsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListSharedSchoolGroupLocations` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListSharedSchoolGroupLocations` Query is of type `ListSharedSchoolGroupLocationsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListSharedSchoolGroupLocations`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListSharedSchoolGroupLocationsVariables } from '@dataconnect/generated';
import { useListSharedSchoolGroupLocations } from '@dataconnect/generated/react'

export default function ListSharedSchoolGroupLocationsComponent() {
  // The `useListSharedSchoolGroupLocations` Query hook has an optional argument of type `ListSharedSchoolGroupLocationsVariables`:
  const listSharedSchoolGroupLocationsVars: ListSharedSchoolGroupLocationsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListSharedSchoolGroupLocations(listSharedSchoolGroupLocationsVars);
  // Variables can be defined inline as well.
  const query = useListSharedSchoolGroupLocations({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListSharedSchoolGroupLocationsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListSharedSchoolGroupLocations();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListSharedSchoolGroupLocations(dataConnect, listSharedSchoolGroupLocationsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedSchoolGroupLocations(listSharedSchoolGroupLocationsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListSharedSchoolGroupLocations(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedSchoolGroupLocations(dataConnect, listSharedSchoolGroupLocationsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.sharedSchoolGroupLocations);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListSharedChristianGroups
You can execute the `ListSharedChristianGroups` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListSharedChristianGroups(dc: DataConnect, vars?: ListSharedChristianGroupsVariables, options?: useDataConnectQueryOptions<ListSharedChristianGroupsData>): UseDataConnectQueryResult<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListSharedChristianGroups(vars?: ListSharedChristianGroupsVariables, options?: useDataConnectQueryOptions<ListSharedChristianGroupsData>): UseDataConnectQueryResult<ListSharedChristianGroupsData, ListSharedChristianGroupsVariables>;
```

### Variables
The `ListSharedChristianGroups` Query has an optional argument of type `ListSharedChristianGroupsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListSharedChristianGroupsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListSharedChristianGroups` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListSharedChristianGroups` Query is of type `ListSharedChristianGroupsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListSharedChristianGroups`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListSharedChristianGroupsVariables } from '@dataconnect/generated';
import { useListSharedChristianGroups } from '@dataconnect/generated/react'

export default function ListSharedChristianGroupsComponent() {
  // The `useListSharedChristianGroups` Query hook has an optional argument of type `ListSharedChristianGroupsVariables`:
  const listSharedChristianGroupsVars: ListSharedChristianGroupsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListSharedChristianGroups(listSharedChristianGroupsVars);
  // Variables can be defined inline as well.
  const query = useListSharedChristianGroups({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListSharedChristianGroupsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListSharedChristianGroups();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListSharedChristianGroups(dataConnect, listSharedChristianGroupsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedChristianGroups(listSharedChristianGroupsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListSharedChristianGroups(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedChristianGroups(dataConnect, listSharedChristianGroupsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.sharedChristianGroups);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListSharedPreBooksellers
You can execute the `ListSharedPreBooksellers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListSharedPreBooksellers(dc: DataConnect, vars?: ListSharedPreBooksellersVariables, options?: useDataConnectQueryOptions<ListSharedPreBooksellersData>): UseDataConnectQueryResult<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListSharedPreBooksellers(vars?: ListSharedPreBooksellersVariables, options?: useDataConnectQueryOptions<ListSharedPreBooksellersData>): UseDataConnectQueryResult<ListSharedPreBooksellersData, ListSharedPreBooksellersVariables>;
```

### Variables
The `ListSharedPreBooksellers` Query has an optional argument of type `ListSharedPreBooksellersVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListSharedPreBooksellersVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListSharedPreBooksellers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListSharedPreBooksellers` Query is of type `ListSharedPreBooksellersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListSharedPreBooksellers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListSharedPreBooksellersVariables } from '@dataconnect/generated';
import { useListSharedPreBooksellers } from '@dataconnect/generated/react'

export default function ListSharedPreBooksellersComponent() {
  // The `useListSharedPreBooksellers` Query hook has an optional argument of type `ListSharedPreBooksellersVariables`:
  const listSharedPreBooksellersVars: ListSharedPreBooksellersVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListSharedPreBooksellers(listSharedPreBooksellersVars);
  // Variables can be defined inline as well.
  const query = useListSharedPreBooksellers({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListSharedPreBooksellersVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListSharedPreBooksellers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListSharedPreBooksellers(dataConnect, listSharedPreBooksellersVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedPreBooksellers(listSharedPreBooksellersVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListSharedPreBooksellers(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListSharedPreBooksellers(dataConnect, listSharedPreBooksellersVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.sharedPreBooksellers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## UpsertChristianGroup
You can execute the `UpsertChristianGroup` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpsertChristianGroup(options?: useDataConnectMutationOptions<UpsertChristianGroupData, FirebaseError, UpsertChristianGroupVariables>): UseDataConnectMutationResult<UpsertChristianGroupData, UpsertChristianGroupVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpsertChristianGroup(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertChristianGroupData, FirebaseError, UpsertChristianGroupVariables>): UseDataConnectMutationResult<UpsertChristianGroupData, UpsertChristianGroupVariables>;
```

### Variables
The `UpsertChristianGroup` Mutation requires an argument of type `UpsertChristianGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `UpsertChristianGroup` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpsertChristianGroup` Mutation is of type `UpsertChristianGroupData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpsertChristianGroupData {
  sharedChristianGroup_upsert: SharedChristianGroup_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpsertChristianGroup`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpsertChristianGroupVariables } from '@dataconnect/generated';
import { useUpsertChristianGroup } from '@dataconnect/generated/react'

export default function UpsertChristianGroupComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpsertChristianGroup();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpsertChristianGroup(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertChristianGroup(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertChristianGroup(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpsertChristianGroup` Mutation requires an argument of type `UpsertChristianGroupVariables`:
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
  mutation.mutate(upsertChristianGroupVars);
  // Variables can be defined inline as well.
  mutation.mutate({ groupCode: ..., organisationName: ..., religionDenomination: ..., category: ..., geographyType: ..., operationalAreas: ..., locationDistrict: ..., locationState: ..., pinCode: ..., address: ..., phoneEmail: ..., runsSchools: ..., totalSchools: ..., totalStudents: ..., centralizedDecision: ..., website: ..., active: ..., sourceSheetRow: ..., sourceHash: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(upsertChristianGroupVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.sharedChristianGroup_upsert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SetChristianGroupActive
You can execute the `SetChristianGroupActive` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useSetChristianGroupActive(options?: useDataConnectMutationOptions<SetChristianGroupActiveData, FirebaseError, SetChristianGroupActiveVariables>): UseDataConnectMutationResult<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useSetChristianGroupActive(dc: DataConnect, options?: useDataConnectMutationOptions<SetChristianGroupActiveData, FirebaseError, SetChristianGroupActiveVariables>): UseDataConnectMutationResult<SetChristianGroupActiveData, SetChristianGroupActiveVariables>;
```

### Variables
The `SetChristianGroupActive` Mutation requires an argument of type `SetChristianGroupActiveVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface SetChristianGroupActiveVariables {
  groupCode: string;
  active: boolean;
}
```
### Return Type
Recall that calling the `SetChristianGroupActive` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `SetChristianGroupActive` Mutation is of type `SetChristianGroupActiveData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface SetChristianGroupActiveData {
  sharedChristianGroup_update?: SharedChristianGroup_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `SetChristianGroupActive`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SetChristianGroupActiveVariables } from '@dataconnect/generated';
import { useSetChristianGroupActive } from '@dataconnect/generated/react'

export default function SetChristianGroupActiveComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useSetChristianGroupActive();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useSetChristianGroupActive(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSetChristianGroupActive(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSetChristianGroupActive(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useSetChristianGroupActive` Mutation requires an argument of type `SetChristianGroupActiveVariables`:
  const setChristianGroupActiveVars: SetChristianGroupActiveVariables = {
    groupCode: ..., 
    active: ..., 
  };
  mutation.mutate(setChristianGroupActiveVars);
  // Variables can be defined inline as well.
  mutation.mutate({ groupCode: ..., active: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(setChristianGroupActiveVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.sharedChristianGroup_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpsertPreBookseller
You can execute the `UpsertPreBookseller` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpsertPreBookseller(options?: useDataConnectMutationOptions<UpsertPreBooksellerData, FirebaseError, UpsertPreBooksellerVariables>): UseDataConnectMutationResult<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpsertPreBookseller(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertPreBooksellerData, FirebaseError, UpsertPreBooksellerVariables>): UseDataConnectMutationResult<UpsertPreBooksellerData, UpsertPreBooksellerVariables>;
```

### Variables
The `UpsertPreBookseller` Mutation requires an argument of type `UpsertPreBooksellerVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `UpsertPreBookseller` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpsertPreBookseller` Mutation is of type `UpsertPreBooksellerData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpsertPreBooksellerData {
  sharedPreBookseller_upsert: SharedPreBookseller_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpsertPreBookseller`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpsertPreBooksellerVariables } from '@dataconnect/generated';
import { useUpsertPreBookseller } from '@dataconnect/generated/react'

export default function UpsertPreBooksellerComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpsertPreBookseller();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpsertPreBookseller(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertPreBookseller(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertPreBookseller(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpsertPreBookseller` Mutation requires an argument of type `UpsertPreBooksellerVariables`:
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
  mutation.mutate(upsertPreBooksellerVars);
  // Variables can be defined inline as well.
  mutation.mutate({ pbsCode: ..., sourceBsCode: ..., vendorName: ..., address: ..., district: ..., state: ..., pinCode: ..., contactPerson: ..., email: ..., taxId: ..., schoolDealCount: ..., approximateStrength: ..., groupSchoolCount: ..., committedDiscount: ..., transportCollaboration: ..., bookingStation: ..., vendorType: ..., paymentStatus: ..., conversionStatus: ..., assignedBsCode: ..., convertedAt: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(upsertPreBooksellerVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.sharedPreBookseller_upsert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

