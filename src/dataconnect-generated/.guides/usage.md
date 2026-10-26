# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useSetBooksellerActualDiscount, useUpsertChristianGroup, useSetChristianGroupActive, useUpsertPreBookseller, useUpsertSharedSchoolGroup, useUpsertSharedSchoolGroupLocation, useUpsertSharedVendor, useUpsertSharedVendorSchool, useUpsertSharedPtCodeUsageHistory, useListOrganisations } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useSetBooksellerActualDiscount(setBooksellerActualDiscountVars);

const { data, isPending, isSuccess, isError, error } = useUpsertChristianGroup(upsertChristianGroupVars);

const { data, isPending, isSuccess, isError, error } = useSetChristianGroupActive(setChristianGroupActiveVars);

const { data, isPending, isSuccess, isError, error } = useUpsertPreBookseller(upsertPreBooksellerVars);

const { data, isPending, isSuccess, isError, error } = useUpsertSharedSchoolGroup(upsertSharedSchoolGroupVars);

const { data, isPending, isSuccess, isError, error } = useUpsertSharedSchoolGroupLocation(upsertSharedSchoolGroupLocationVars);

const { data, isPending, isSuccess, isError, error } = useUpsertSharedVendor(upsertSharedVendorVars);

const { data, isPending, isSuccess, isError, error } = useUpsertSharedVendorSchool(upsertSharedVendorSchoolVars);

const { data, isPending, isSuccess, isError, error } = useUpsertSharedPtCodeUsageHistory(upsertSharedPtCodeUsageHistoryVars);

const { data, isPending, isSuccess, isError, error } = useListOrganisations(listOrganisationsVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { setBooksellerActualDiscount, upsertChristianGroup, setChristianGroupActive, upsertPreBookseller, upsertSharedSchoolGroup, upsertSharedSchoolGroupLocation, upsertSharedVendor, upsertSharedVendorSchool, upsertSharedPtCodeUsageHistory, listOrganisations } from '@dataconnect/generated';


// Operation SetBooksellerActualDiscount:  For variables, look at type SetBooksellerActualDiscountVars in ../index.d.ts
const { data } = await SetBooksellerActualDiscount(dataConnect, setBooksellerActualDiscountVars);

// Operation UpsertChristianGroup:  For variables, look at type UpsertChristianGroupVars in ../index.d.ts
const { data } = await UpsertChristianGroup(dataConnect, upsertChristianGroupVars);

// Operation SetChristianGroupActive:  For variables, look at type SetChristianGroupActiveVars in ../index.d.ts
const { data } = await SetChristianGroupActive(dataConnect, setChristianGroupActiveVars);

// Operation UpsertPreBookseller:  For variables, look at type UpsertPreBooksellerVars in ../index.d.ts
const { data } = await UpsertPreBookseller(dataConnect, upsertPreBooksellerVars);

// Operation UpsertSharedSchoolGroup:  For variables, look at type UpsertSharedSchoolGroupVars in ../index.d.ts
const { data } = await UpsertSharedSchoolGroup(dataConnect, upsertSharedSchoolGroupVars);

// Operation UpsertSharedSchoolGroupLocation:  For variables, look at type UpsertSharedSchoolGroupLocationVars in ../index.d.ts
const { data } = await UpsertSharedSchoolGroupLocation(dataConnect, upsertSharedSchoolGroupLocationVars);

// Operation UpsertSharedVendor:  For variables, look at type UpsertSharedVendorVars in ../index.d.ts
const { data } = await UpsertSharedVendor(dataConnect, upsertSharedVendorVars);

// Operation UpsertSharedVendorSchool:  For variables, look at type UpsertSharedVendorSchoolVars in ../index.d.ts
const { data } = await UpsertSharedVendorSchool(dataConnect, upsertSharedVendorSchoolVars);

// Operation UpsertSharedPtCodeUsageHistory:  For variables, look at type UpsertSharedPtCodeUsageHistoryVars in ../index.d.ts
const { data } = await UpsertSharedPtCodeUsageHistory(dataConnect, upsertSharedPtCodeUsageHistoryVars);

// Operation ListOrganisations:  For variables, look at type ListOrganisationsVars in ../index.d.ts
const { data } = await ListOrganisations(dataConnect, listOrganisationsVars);


```