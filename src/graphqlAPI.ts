import { gql } from 'graphql-request';

export const GET_ALL_USERS = gql`
  query {
      user {
        id
        username
        email
      }
    }
  `;

export const SIGN_UP_USER = gql`
  mutation SignUpUser($username: String!, $email: String!, $password: String!) {
    insert_user_one(object: {username: $username, email: $email, password: $password }){
      id
      username
      email
    }
  }
`;

export const GET_USER = gql`
  query GetUserByEmail($email: String!) {
      user(where: { email: { _eq: $email } }) {
        id
        username
        password
      }
    }
  `;