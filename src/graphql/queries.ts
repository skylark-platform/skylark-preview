import { gql } from "graphql-request";

export const wrapQueryName = (str: string) => `SL_PREVIEW_${str}`.toUpperCase();

export const LIST_AVAILABILITY_DIMENSIONS = gql`
  query ${wrapQueryName("LIST_AVAILABILITY_DIMENSIONS")}($nextToken: String) {
    listDimensions(next_token: $nextToken, limit: 50) {
      objects {
        uid
        external_id
        title
        slug
        description
      }
      count
      next_token
    }
  }
`;

// This is used to check the user is connected to Skylark + in tests
export const GET_USER_AND_ACCOUNT = gql`
query ${wrapQueryName("GET_USER_AND_ACCOUNT")} {
  user: getUser {
    account
    role
    permissions
  }
  account: getAccount {
    config {
      raise_uid_exception
      draft_update
      default_language
    }
    account_id
    skylark_version
  }
}
`;
