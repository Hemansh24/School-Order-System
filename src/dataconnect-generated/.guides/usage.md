# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListOrganisations, useSearchOrganisations, useGetOrganisationByPrCode, useListBooksellers, useGetBooksellerByCode, useListItems, useGetItemByCode, useListBooksellerSchoolMapping } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListOrganisations();

const { data, isPending, isSuccess, isError, error } = useSearchOrganisations(searchOrganisationsVars);

const { data, isPending, isSuccess, isError, error } = useGetOrganisationByPrCode(getOrganisationByPrCodeVars);

const { data, isPending, isSuccess, isError, error } = useListBooksellers();

const { data, isPending, isSuccess, isError, error } = useGetBooksellerByCode(getBooksellerByCodeVars);

const { data, isPending, isSuccess, isError, error } = useListItems();

const { data, isPending, isSuccess, isError, error } = useGetItemByCode(getItemByCodeVars);

const { data, isPending, isSuccess, isError, error } = useListBooksellerSchoolMapping();

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
import { listOrganisations, searchOrganisations, getOrganisationByPrCode, listBooksellers, getBooksellerByCode, listItems, getItemByCode, listBooksellerSchoolMapping } from '@dataconnect/generated';


// Operation ListOrganisations: 
const { data } = await ListOrganisations(dataConnect);

// Operation SearchOrganisations:  For variables, look at type SearchOrganisationsVars in ../index.d.ts
const { data } = await SearchOrganisations(dataConnect, searchOrganisationsVars);

// Operation GetOrganisationByPrCode:  For variables, look at type GetOrganisationByPrCodeVars in ../index.d.ts
const { data } = await GetOrganisationByPrCode(dataConnect, getOrganisationByPrCodeVars);

// Operation ListBooksellers: 
const { data } = await ListBooksellers(dataConnect);

// Operation GetBooksellerByCode:  For variables, look at type GetBooksellerByCodeVars in ../index.d.ts
const { data } = await GetBooksellerByCode(dataConnect, getBooksellerByCodeVars);

// Operation ListItems: 
const { data } = await ListItems(dataConnect);

// Operation GetItemByCode:  For variables, look at type GetItemByCodeVars in ../index.d.ts
const { data } = await GetItemByCode(dataConnect, getItemByCodeVars);

// Operation ListBooksellerSchoolMapping: 
const { data } = await ListBooksellerSchoolMapping(dataConnect);


```