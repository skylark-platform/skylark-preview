export type SkylarkUserPermission =
  | "READ"
  | "WRITE"
  | "IGNORE_AVAILABILITY"
  | "TIME_TRAVEL"
  | "ACCOUNT_SETUP"
  | "SELF_CONFIG"
  | "KEY_MANAGEMENT";

export interface SkylarkCredentials {
  uri: string;
  apiKey: string;
}

// Unparsed Skylark Objects
export interface SkylarkGraphQLAvailabilityDimensionValue {
  uid: string;
  external_id: string;
  slug: string;
  title: string | null;
  description: string | null;
}

export interface SkylarkGraphQLAvailabilityDimension {
  uid: string;
  external_id: string;
  slug: string;
  title: string | null;
  description: string | null;
}

export interface SkylarkGraphQLAvailabilityDimensionWithValues
  extends SkylarkGraphQLAvailabilityDimension {
  values: {
    next_token: string;
    objects: SkylarkGraphQLAvailabilityDimensionValue[];
  };
}

// Parsed Skylark Objects
export interface ParsedSkylarkDimensionsWithValues
  extends SkylarkGraphQLAvailabilityDimension {
  values: SkylarkGraphQLAvailabilityDimensionValue[];
}

// GraphQL Responses
export type GQLSkylarkListAvailabilityDimensionValuesResponse = Record<
  string,
  {
    uid: string;
    values: {
      next_token: string;
      objects: SkylarkGraphQLAvailabilityDimensionValue[];
    };
  }
>;

export interface GQLSkylarkListAvailabilityDimensionsResponse {
  listDimensions: {
    next_token: string;
    objects: SkylarkGraphQLAvailabilityDimension[];
  };
}

export interface GQLSkylarkUserAndAccountResponse {
  user: {
    account: string;
    role: string;
    permissions: SkylarkUserPermission[];
  };
  account: {
    config: {
      raise_uid_exception: boolean | null;
      draft_update: boolean | null;
      default_language: string;
    };
    account_id: string;
    skylark_version: string;
  };
}
