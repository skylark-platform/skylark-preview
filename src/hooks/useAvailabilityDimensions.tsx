import {
  InfiniteData,
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { QueryKeys } from "../constants";
import { skylarkRequest } from "../lib/requestClient";
import { LIST_AVAILABILITY_DIMENSIONS } from "../graphql";
import {
  GQLSkylarkListAvailabilityDimensionsResponse,
  SkylarkGraphQLAvailabilityDimension,
} from "../interfaces";

export const useAvailabilityDimensions = ({
  uri,
  token,
}: {
  uri: string;
  token: string;
}) => {
  const { data, fetchNextPage, hasNextPage, ...rest } = useInfiniteQuery<
    GQLSkylarkListAvailabilityDimensionsResponse,
    Error,
    InfiniteData<GQLSkylarkListAvailabilityDimensionsResponse>,
    QueryKey,
    string
  >({
    enabled: !!(uri && token),
    queryKey: [QueryKeys.AvailabilityDimensions, LIST_AVAILABILITY_DIMENSIONS],
    queryFn: ({
      pageParam: nextToken,
    }: QueryFunctionContext<QueryKey, string>) =>
      skylarkRequest({
        uri,
        token,
        query: LIST_AVAILABILITY_DIMENSIONS,
        variables: {
          nextToken,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.listDimensions.next_token || undefined,
    initialPageParam: "",
  });

  // This if statement ensures that all data is fetched
  // We could remove it and add a load more button
  if (hasNextPage) {
    void fetchNextPage();
  }

  const dimensions: SkylarkGraphQLAvailabilityDimension[] | undefined =
    !hasNextPage && data
      ? data.pages.flatMap((item) => item.listDimensions.objects)
      : undefined;

  return {
    dimensions,
    ...rest,
  };
};
