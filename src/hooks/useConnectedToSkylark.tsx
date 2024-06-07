import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { GET_USER_AND_ACCOUNT } from "../graphql";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import {
  GQLSkylarkUserAndAccountResponse,
  SkylarkCredentials,
  SkylarkUserPermission,
} from "../interfaces";

export const REQUIRED_PERMISSIONS: SkylarkUserPermission[] = [
  "READ",
  "TIME_TRAVEL",
];

export const useConnectedToSkylark = (
  credentials: SkylarkCredentials,
  opts: { withInterval: boolean },
) => {
  const [{ uri, apiKey }] = useDebounce(credentials, 500);

  const enabled = !!uri;

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery<
    GQLSkylarkUserAndAccountResponse | undefined,
    { response?: { errors?: { errorType?: string; message?: string }[] } }
  >({
    queryKey: ["credentialValidator", GET_USER_AND_ACCOUNT, uri, apiKey],
    queryFn: async (): Promise<
      GQLSkylarkUserAndAccountResponse | undefined
    > => {
      return uri
        ? request(
            uri,
            GET_USER_AND_ACCOUNT,
            {},
            {
              Authorization: apiKey,
            },
          )
        : undefined;
    },
    enabled,
    retry: false,
    cacheTime: 0,
    staleTime: 0,
    refetchInterval: opts.withInterval ? 2000 : false,
  });

  useEffect(() => {
    refetch();
  }, [uri, apiKey, refetch]);

  const unauthenticated =
    error?.response?.errors?.[0]?.errorType === "UnauthorizedException";
  const invalidUri = !uri || (!data && isError && !unauthenticated);

  const tokenHasCorrectPermissions =
    data?.user &&
    REQUIRED_PERMISSIONS.every((perm) => data.user.permissions.includes(perm));
  const invalidToken = invalidUri || (error && unauthenticated) || false;

  const isConnected =
    enabled && !!(!invalidUri && !invalidToken && (isLoading || isSuccess));

  const isLoadingWrapper = Boolean(
    credentials.uri &&
      (isLoading || credentials.uri !== uri || credentials.apiKey !== apiKey),
  );

  const permissions = {
    canRead: Boolean(data?.user.permissions.includes("READ")),
    canReadDrafts: Boolean(
      data?.user.permissions.includes("WRITE") &&
        data?.user.permissions.includes("IGNORE_AVAILABILITY"),
    ),
    canTimeTravel: Boolean(data?.user.permissions.includes("TIME_TRAVEL")),
    canIgnoreAvailability: Boolean(
      data?.user.permissions.includes("IGNORE_AVAILABILITY"),
    ),
  };

  return {
    user: {
      ...data?.user,
      ...permissions,
    },
    account: data?.account,
    isLoading: isLoadingWrapper,
    isConnected,
    invalidUri,
    invalidToken,
    tokenHasCorrectPermissions,
    permissions,
  };
};
