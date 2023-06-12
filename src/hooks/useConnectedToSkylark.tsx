import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { GET_ACTIVATION_STATUS } from "../graphql";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";

export const useConnectedToSkylark = (credentials: {
  uri: string;
  apiKey: string;
}) => {
  const [{ uri, apiKey }] = useDebounce(credentials, 500);

  const enabled = !!uri;

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery<
    object,
    { response?: { errors?: { errorType?: string; message?: string }[] } }
  >({
    queryKey: ["credentialValidator", GET_ACTIVATION_STATUS, credentials],
    queryFn: uri
      ? async () => {
          return request(
            uri,
            GET_ACTIVATION_STATUS,
            {},
            {
              Authorization: apiKey,
            }
          );
        }
      : undefined,
    enabled,
    retry: false,
    cacheTime: 0,
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

  return {
    isLoading: enabled && isLoading,
    isConnected,
    invalidUri,
    invalidToken,
  };
};
