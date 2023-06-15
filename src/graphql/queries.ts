import { gql } from "graphql-request";

export const LIST_AVAILABILITY_DIMENSIONS = gql`
  query LIST_AVAILABILITY_DIMENSIONS($nextToken: String) {
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
export const GET_SKYLARK_OBJECT_TYPES = gql`
  query GET_SKYLARK_OBJECT_TYPES {
    __type(name: "Metadata") {
      possibleTypes {
        name
      }
    }
  }
`;
