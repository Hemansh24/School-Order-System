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
- [**Mutations**](#mutations)

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
useListOrganisations(dc: DataConnect, options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListOrganisations(options?: useDataConnectQueryOptions<ListOrganisationsData>): UseDataConnectQueryResult<ListOrganisationsData, undefined>;
```

### Variables
The `ListOrganisations` Query has no variables.
### Return Type
Recall that calling the `ListOrganisations` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListOrganisations` Query is of type `ListOrganisationsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListOrganisations`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListOrganisations } from '@dataconnect/generated/react'

export default function ListOrganisationsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListOrganisations();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListOrganisations(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListOrganisations(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListOrganisations(dataConnect, options);

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
useListBooksellers(dc: DataConnect, options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListBooksellers(options?: useDataConnectQueryOptions<ListBooksellersData>): UseDataConnectQueryResult<ListBooksellersData, undefined>;
```

### Variables
The `ListBooksellers` Query has no variables.
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
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    vendorType?: string | null;
  } & Bookseller_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListBooksellers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListBooksellers } from '@dataconnect/generated/react'

export default function ListBooksellersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListBooksellers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListBooksellers(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellers(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListBooksellers(dataConnect, options);

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
useListItems(dc: DataConnect, options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListItems(options?: useDataConnectQueryOptions<ListItemsData>): UseDataConnectQueryResult<ListItemsData, undefined>;
```

### Variables
The `ListItems` Query has no variables.
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
    languageCode?: string | null;
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
import { connectorConfig } from '@dataconnect/generated';
import { useListItems } from '@dataconnect/generated/react'

export default function ListItemsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListItems();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListItems(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListItems(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListItems(dataConnect, options);

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

# Mutations

No Mutations were generated for the `example` connector.

If you want to learn more about how to use Mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

