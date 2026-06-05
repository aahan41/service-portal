import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminStats, ApplicationDetail, ApplicationInput, ApplicationListResponse, ApplicationUpdate, AuthResponse, Category, CategoryInput, CategoryUpdate, ExportApplicationsParams, HealthStatus, ListApplicationsParams, ListServicesParams, ListUsersParams, ListWalletRequestsParams, LoginInput, MessageResponse, Notification, ServiceInput, ServiceUpdate, ServiceWithCategory, SignupInput, User, UserListResponse, UserUpdate, WalletAdjustment, WalletBalance, WalletRequest, WalletRequestInput, WalletRequestUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSignupUrl: () => string;
/**
 * @summary Create a new user account
 */
export declare const signup: (signupInput: SignupInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getSignupMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof signup>>, TError, {
        data: BodyType<SignupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof signup>>, TError, {
    data: BodyType<SignupInput>;
}, TContext>;
export type SignupMutationResult = NonNullable<Awaited<ReturnType<typeof signup>>>;
export type SignupMutationBody = BodyType<SignupInput>;
export type SignupMutationError = ErrorType<void>;
/**
* @summary Create a new user account
*/
export declare const useSignup: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof signup>>, TError, {
        data: BodyType<SignupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof signup>>, TError, {
    data: BodyType<SignupInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login with email and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login with email and password
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current user
 */
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
/**
 * @summary List all users (admin only)
 */
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<UserListResponse>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get user by ID
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Get user by ID
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
/**
 * @summary Update user (admin only)
 */
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
* @summary Update user (admin only)
*/
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getAdjustUserWalletUrl: (id: number) => string;
/**
 * @summary Admin manually adjust user wallet balance
 */
export declare const adjustUserWallet: (id: number, walletAdjustment: WalletAdjustment, options?: RequestInit) => Promise<User>;
export declare const getAdjustUserWalletMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
        id: number;
        data: BodyType<WalletAdjustment>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
    id: number;
    data: BodyType<WalletAdjustment>;
}, TContext>;
export type AdjustUserWalletMutationResult = NonNullable<Awaited<ReturnType<typeof adjustUserWallet>>>;
export type AdjustUserWalletMutationBody = BodyType<WalletAdjustment>;
export type AdjustUserWalletMutationError = ErrorType<unknown>;
/**
* @summary Admin manually adjust user wallet balance
*/
export declare const useAdjustUserWallet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
        id: number;
        data: BodyType<WalletAdjustment>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
    id: number;
    data: BodyType<WalletAdjustment>;
}, TContext>;
export declare const getListCategoriesUrl: () => string;
/**
 * @summary List all categories
 */
export declare const listCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCategoryUrl: () => string;
/**
 * @summary Create a new category (admin only)
 */
export declare const createCategory: (categoryInput: CategoryInput, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Create a new category (admin only)
*/
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export declare const getUpdateCategoryUrl: (id: number) => string;
/**
 * @summary Update category (admin only)
 */
export declare const updateCategory: (id: number, categoryUpdate: CategoryUpdate, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<CategoryUpdate>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Update category (admin only)
*/
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export declare const getDeleteCategoryUrl: (id: number) => string;
/**
 * @summary Delete category (admin only)
 */
export declare const deleteCategory: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
* @summary Delete category (admin only)
*/
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getListServicesUrl: (params?: ListServicesParams) => string;
/**
 * @summary List services with optional search and category filter
 */
export declare const listServices: (params?: ListServicesParams, options?: RequestInit) => Promise<ServiceWithCategory[]>;
export declare const getListServicesQueryKey: (params?: ListServicesParams) => readonly ["/api/services", ...ListServicesParams[]];
export declare const getListServicesQueryOptions: <TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(params?: ListServicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListServicesQueryResult = NonNullable<Awaited<ReturnType<typeof listServices>>>;
export type ListServicesQueryError = ErrorType<unknown>;
/**
 * @summary List services with optional search and category filter
 */
export declare function useListServices<TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(params?: ListServicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateServiceUrl: () => string;
/**
 * @summary Create a new service (admin only)
 */
export declare const createService: (serviceInput: ServiceInput, options?: RequestInit) => Promise<ServiceWithCategory>;
export declare const getCreateServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
        data: BodyType<ServiceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
    data: BodyType<ServiceInput>;
}, TContext>;
export type CreateServiceMutationResult = NonNullable<Awaited<ReturnType<typeof createService>>>;
export type CreateServiceMutationBody = BodyType<ServiceInput>;
export type CreateServiceMutationError = ErrorType<unknown>;
/**
* @summary Create a new service (admin only)
*/
export declare const useCreateService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
        data: BodyType<ServiceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createService>>, TError, {
    data: BodyType<ServiceInput>;
}, TContext>;
export declare const getGetServiceUrl: (id: number) => string;
/**
 * @summary Get service by ID
 */
export declare const getService: (id: number, options?: RequestInit) => Promise<ServiceWithCategory>;
export declare const getGetServiceQueryKey: (id: number) => readonly [`/api/services/${number}`];
export declare const getGetServiceQueryOptions: <TData = Awaited<ReturnType<typeof getService>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetServiceQueryResult = NonNullable<Awaited<ReturnType<typeof getService>>>;
export type GetServiceQueryError = ErrorType<unknown>;
/**
 * @summary Get service by ID
 */
export declare function useGetService<TData = Awaited<ReturnType<typeof getService>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateServiceUrl: (id: number) => string;
/**
 * @summary Update service (admin only)
 */
export declare const updateService: (id: number, serviceUpdate: ServiceUpdate, options?: RequestInit) => Promise<ServiceWithCategory>;
export declare const getUpdateServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
        id: number;
        data: BodyType<ServiceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
    id: number;
    data: BodyType<ServiceUpdate>;
}, TContext>;
export type UpdateServiceMutationResult = NonNullable<Awaited<ReturnType<typeof updateService>>>;
export type UpdateServiceMutationBody = BodyType<ServiceUpdate>;
export type UpdateServiceMutationError = ErrorType<unknown>;
/**
* @summary Update service (admin only)
*/
export declare const useUpdateService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
        id: number;
        data: BodyType<ServiceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateService>>, TError, {
    id: number;
    data: BodyType<ServiceUpdate>;
}, TContext>;
export declare const getDeleteServiceUrl: (id: number) => string;
/**
 * @summary Delete service (admin only)
 */
export declare const deleteService: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
    id: number;
}, TContext>;
export type DeleteServiceMutationResult = NonNullable<Awaited<ReturnType<typeof deleteService>>>;
export type DeleteServiceMutationError = ErrorType<unknown>;
/**
* @summary Delete service (admin only)
*/
export declare const useDeleteService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteService>>, TError, {
    id: number;
}, TContext>;
export declare const getListApplicationsUrl: (params?: ListApplicationsParams) => string;
/**
 * @summary List applications (admin gets all, user gets own)
 */
export declare const listApplications: (params?: ListApplicationsParams, options?: RequestInit) => Promise<ApplicationListResponse>;
export declare const getListApplicationsQueryKey: (params?: ListApplicationsParams) => readonly ["/api/applications", ...ListApplicationsParams[]];
export declare const getListApplicationsQueryOptions: <TData = Awaited<ReturnType<typeof listApplications>>, TError = ErrorType<unknown>>(params?: ListApplicationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listApplications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListApplicationsQueryResult = NonNullable<Awaited<ReturnType<typeof listApplications>>>;
export type ListApplicationsQueryError = ErrorType<unknown>;
/**
 * @summary List applications (admin gets all, user gets own)
 */
export declare function useListApplications<TData = Awaited<ReturnType<typeof listApplications>>, TError = ErrorType<unknown>>(params?: ListApplicationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateApplicationUrl: () => string;
/**
 * @summary Submit a new application
 */
export declare const createApplication: (applicationInput: ApplicationInput, options?: RequestInit) => Promise<ApplicationDetail>;
export declare const getCreateApplicationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createApplication>>, TError, {
        data: BodyType<ApplicationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createApplication>>, TError, {
    data: BodyType<ApplicationInput>;
}, TContext>;
export type CreateApplicationMutationResult = NonNullable<Awaited<ReturnType<typeof createApplication>>>;
export type CreateApplicationMutationBody = BodyType<ApplicationInput>;
export type CreateApplicationMutationError = ErrorType<unknown>;
/**
* @summary Submit a new application
*/
export declare const useCreateApplication: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createApplication>>, TError, {
        data: BodyType<ApplicationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createApplication>>, TError, {
    data: BodyType<ApplicationInput>;
}, TContext>;
export declare const getGetApplicationUrl: (id: number) => string;
/**
 * @summary Get application by ID
 */
export declare const getApplication: (id: number, options?: RequestInit) => Promise<ApplicationDetail>;
export declare const getGetApplicationQueryKey: (id: number) => readonly [`/api/applications/${number}`];
export declare const getGetApplicationQueryOptions: <TData = Awaited<ReturnType<typeof getApplication>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getApplication>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getApplication>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetApplicationQueryResult = NonNullable<Awaited<ReturnType<typeof getApplication>>>;
export type GetApplicationQueryError = ErrorType<unknown>;
/**
 * @summary Get application by ID
 */
export declare function useGetApplication<TData = Awaited<ReturnType<typeof getApplication>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getApplication>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateApplicationUrl: (id: number) => string;
/**
 * @summary Update application status, result, notes (admin only)
 */
export declare const updateApplication: (id: number, applicationUpdate: ApplicationUpdate, options?: RequestInit) => Promise<ApplicationDetail>;
export declare const getUpdateApplicationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateApplication>>, TError, {
        id: number;
        data: BodyType<ApplicationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateApplication>>, TError, {
    id: number;
    data: BodyType<ApplicationUpdate>;
}, TContext>;
export type UpdateApplicationMutationResult = NonNullable<Awaited<ReturnType<typeof updateApplication>>>;
export type UpdateApplicationMutationBody = BodyType<ApplicationUpdate>;
export type UpdateApplicationMutationError = ErrorType<unknown>;
/**
* @summary Update application status, result, notes (admin only)
*/
export declare const useUpdateApplication: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateApplication>>, TError, {
        id: number;
        data: BodyType<ApplicationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateApplication>>, TError, {
    id: number;
    data: BodyType<ApplicationUpdate>;
}, TContext>;
export declare const getGetWalletBalanceUrl: () => string;
/**
 * @summary Get current user wallet balance
 */
export declare const getWalletBalance: (options?: RequestInit) => Promise<WalletBalance>;
export declare const getGetWalletBalanceQueryKey: () => readonly ["/api/wallet/balance"];
export declare const getGetWalletBalanceQueryOptions: <TData = Awaited<ReturnType<typeof getWalletBalance>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWalletBalance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWalletBalance>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWalletBalanceQueryResult = NonNullable<Awaited<ReturnType<typeof getWalletBalance>>>;
export type GetWalletBalanceQueryError = ErrorType<unknown>;
/**
 * @summary Get current user wallet balance
 */
export declare function useGetWalletBalance<TData = Awaited<ReturnType<typeof getWalletBalance>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWalletBalance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListWalletRequestsUrl: (params?: ListWalletRequestsParams) => string;
/**
 * @summary List wallet top-up requests (admin gets all, user gets own)
 */
export declare const listWalletRequests: (params?: ListWalletRequestsParams, options?: RequestInit) => Promise<WalletRequest[]>;
export declare const getListWalletRequestsQueryKey: (params?: ListWalletRequestsParams) => readonly ["/api/wallet/requests", ...ListWalletRequestsParams[]];
export declare const getListWalletRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listWalletRequests>>, TError = ErrorType<unknown>>(params?: ListWalletRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWalletRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listWalletRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListWalletRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listWalletRequests>>>;
export type ListWalletRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List wallet top-up requests (admin gets all, user gets own)
 */
export declare function useListWalletRequests<TData = Awaited<ReturnType<typeof listWalletRequests>>, TError = ErrorType<unknown>>(params?: ListWalletRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWalletRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateWalletRequestUrl: () => string;
/**
 * @summary Submit a wallet top-up request
 */
export declare const createWalletRequest: (walletRequestInput: WalletRequestInput, options?: RequestInit) => Promise<WalletRequest>;
export declare const getCreateWalletRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWalletRequest>>, TError, {
        data: BodyType<WalletRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWalletRequest>>, TError, {
    data: BodyType<WalletRequestInput>;
}, TContext>;
export type CreateWalletRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createWalletRequest>>>;
export type CreateWalletRequestMutationBody = BodyType<WalletRequestInput>;
export type CreateWalletRequestMutationError = ErrorType<unknown>;
/**
* @summary Submit a wallet top-up request
*/
export declare const useCreateWalletRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWalletRequest>>, TError, {
        data: BodyType<WalletRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWalletRequest>>, TError, {
    data: BodyType<WalletRequestInput>;
}, TContext>;
export declare const getUpdateWalletRequestUrl: (id: number) => string;
/**
 * @summary Approve or reject wallet request (admin only)
 */
export declare const updateWalletRequest: (id: number, walletRequestUpdate: WalletRequestUpdate, options?: RequestInit) => Promise<WalletRequest>;
export declare const getUpdateWalletRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWalletRequest>>, TError, {
        id: number;
        data: BodyType<WalletRequestUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateWalletRequest>>, TError, {
    id: number;
    data: BodyType<WalletRequestUpdate>;
}, TContext>;
export type UpdateWalletRequestMutationResult = NonNullable<Awaited<ReturnType<typeof updateWalletRequest>>>;
export type UpdateWalletRequestMutationBody = BodyType<WalletRequestUpdate>;
export type UpdateWalletRequestMutationError = ErrorType<unknown>;
/**
* @summary Approve or reject wallet request (admin only)
*/
export declare const useUpdateWalletRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWalletRequest>>, TError, {
        id: number;
        data: BodyType<WalletRequestUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateWalletRequest>>, TError, {
    id: number;
    data: BodyType<WalletRequestUpdate>;
}, TContext>;
export declare const getListNotificationsUrl: () => string;
/**
 * @summary Get notifications for current user
 */
export declare const listNotifications: (options?: RequestInit) => Promise<Notification[]>;
export declare const getListNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary Get notifications for current user
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkNotificationReadUrl: (id: number) => string;
/**
 * @summary Mark a notification as read
 */
export declare const markNotificationRead: (id: number, options?: RequestInit) => Promise<Notification>;
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<unknown>;
/**
* @summary Mark a notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export declare const getMarkAllNotificationsReadUrl: () => string;
/**
 * @summary Mark all notifications as read
 */
export declare const markAllNotificationsRead: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getMarkAllNotificationsReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export type MarkAllNotificationsReadMutationResult = NonNullable<Awaited<ReturnType<typeof markAllNotificationsRead>>>;
export type MarkAllNotificationsReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all notifications as read
*/
export declare const useMarkAllNotificationsRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Get admin dashboard statistics
 */
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard statistics
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getExportApplicationsUrl: (params?: ExportApplicationsParams) => string;
/**
 * @summary Export applications as CSV
 */
export declare const exportApplications: (params?: ExportApplicationsParams, options?: RequestInit) => Promise<string>;
export declare const getExportApplicationsQueryKey: (params?: ExportApplicationsParams) => readonly ["/api/admin/export/applications", ...ExportApplicationsParams[]];
export declare const getExportApplicationsQueryOptions: <TData = Awaited<ReturnType<typeof exportApplications>>, TError = ErrorType<unknown>>(params?: ExportApplicationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof exportApplications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ExportApplicationsQueryResult = NonNullable<Awaited<ReturnType<typeof exportApplications>>>;
export type ExportApplicationsQueryError = ErrorType<unknown>;
/**
 * @summary Export applications as CSV
 */
export declare function useExportApplications<TData = Awaited<ReturnType<typeof exportApplications>>, TError = ErrorType<unknown>>(params?: ExportApplicationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map