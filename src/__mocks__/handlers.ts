import { graphql } from "msw";

import GQLSkylarkDimensionValues from "./fixtures/listDimensionValues.json";
import GQLSkylarkDimensions from "./fixtures/listDimensions.json";
import GQLSkylarkObjectTypes from "./fixtures/getSkylarkObjectTypes.json";
import GQLSkylarkAccountAndUser from "./fixtures/accountAndUser.json";
import { wrapQueryName } from "../graphql";

export const handlers = [
  graphql.query(
    wrapQueryName("LIST_AVAILABILITY_DIMENSIONS"),
    (_, res, ctx) => {
      return res(ctx.data(GQLSkylarkDimensions.data));
    },
  ),

  graphql.query(
    wrapQueryName("LIST_AVAILABILITY_DIMENSION_VALUES"),
    (_, res, ctx) => {
      return res(ctx.data(GQLSkylarkDimensionValues.data));
    },
  ),

  graphql.query(wrapQueryName("GET_SKYLARK_OBJECT_TYPES"), (_, res, ctx) => {
    return res(ctx.data(GQLSkylarkObjectTypes.data));
  }),

  graphql.query(wrapQueryName("GET_USER_AND_ACCOUNT"), (_, res, ctx) => {
    return res(ctx.data(GQLSkylarkAccountAndUser.data));
  }),
];
