import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLError } from "graphql";

const typeDefs = `
  type Query {
    users: [User]
  }

  type User {
    username: String!
    avatar: String!
  }
`;

const resolvers = {
  Query: {
    users: () => [
      {
        username: "notrab",
      },
      {
        username: "rauchg",
      },
    ],
  },
  User: {
    avatar: (root) => `https://github.com/${root.username}.png`,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default async (req, res) => {
  const { method, body, query: qs } = req;

  if (method !== "GET" && method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "GET,POST")
      .send("Method not allowed");
  }

  if (!qs.query && method === "GET")
    return res.status(400).json({
      statusCode: 400,
      error: "Bad Request",
      message: "GET query missing",
    });

  const { query, variables, operationName } = method === "GET" ? qs : body;

  try {
    const result = await graphql(
      schema,
      query,
      null,
      null,
      variables,
      operationName
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(new GraphQLError(err.message));
  }
};
