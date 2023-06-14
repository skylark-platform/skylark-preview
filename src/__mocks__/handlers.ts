import { graphql } from "msw";

import GQLSkylarkDimensionValues from "./fixtures/listDimensionValues.json";
import GQLSkylarkDimensions from "./fixtures/listDimensions.json";

export const handlers = [
  graphql.query("LIST_AVAILABILITY_DIMENSIONS", (_, res, ctx) => {
    return res(ctx.data(GQLSkylarkDimensions.data));
  }),

  graphql.query("LIST_AVAILABILITY_DIMENSION_VALUES", (_, res, ctx) => {
    return res(ctx.data(GQLSkylarkDimensionValues.data));
  }),
];
