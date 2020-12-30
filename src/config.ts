export const ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || "admin_secret";
export const ACCESS_TOKEN_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || "access_token_secret";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret";
export const PORT = process.env.PORT;
export const ENDPOINT = process.env.ENDPOINT || "";