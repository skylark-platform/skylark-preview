import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { GET_SKYLARK_OBJECT_TYPES } from "../graphql";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import { SkylarkCredentials } from "../interfaces";

export const useConnectedToSkylark = (
  credentials: SkylarkCredentials,
  opts: { withInterval: boolean },
) => {
  const [{ uri, apiKey }] = useDebounce(credentials, 500);

  const enabled = !!uri;

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery<
    object,
    { response?: { errors?: { errorType?: string; message?: string }[] } }
  >({
    queryKey: ["credentialValidator", GET_SKYLARK_OBJECT_TYPES, uri, apiKey],
    queryFn: uri
      ? async () => {
          return request(
            uri,
            GET_SKYLARK_OBJECT_TYPES,
            {},
            {
              Authorization: apiKey,
            },
          );
        }
      : undefined,
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
  const invalidToken = invalidUri || (error && unauthenticated) || false;

  const isConnected =
    enabled && !!(!invalidUri && !invalidToken && (isLoading || isSuccess));

  const isLoadingWrapper = Boolean(
    credentials.uri &&
      (isLoading || credentials.uri !== uri || credentials.apiKey !== apiKey),
  );

  return {
    isLoading: isLoadingWrapper,
    isConnected,
    invalidUri,
    invalidToken,
  };
};
