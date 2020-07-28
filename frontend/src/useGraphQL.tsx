import { stringify } from "flatted";
import { gql, useApolloClient } from "@apollo/client";

const GET_BOOKS = gql`
  query books {
    books {
      title
      autor
    }
  }
`;

export const useGraphQL = () => {
  const client = useApolloClient();

  const getBooks = (spansHeader: string) => {
    return client
      .query({
        query: GET_BOOKS,
        context: {
          headers: {
            "graphql-current-spans": spansHeader || "",
          },
        },
      })
      .then((res) => {
        console.log("res", res);
        return res;
      });
  };
  return {
    getBooks,
  };
};
