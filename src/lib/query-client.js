import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// Treat fetched data as fresh for 5 min: revisiting a page renders
			// instantly from cache instead of refetching what the user just saw.
			staleTime: 5 * 60 * 1000,
			// Keep unused data in cache for 30 min before garbage-collecting.
			gcTime: 30 * 60 * 1000,
		},
	},
});