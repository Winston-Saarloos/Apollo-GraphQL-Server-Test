const { ApolloServer, gql } = require('apollo-server');
const fetch = require("node-fetch");
const leagues = require('./example-data/leagues.json');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

 # LEAGUE TOOLS SPECIFIC TYPES
  type League {
    id: ID!
    name: String
    owners: [Int]!
    seasons: [Season]
  }
  
  type Season {
    id: ID!
    startDate: String
    endDate: String
    totalGames: Int
    maxTeamSize: Int
    teams: [Team]
    matches: [Match]
  }
  
  type Match {
    id: ID!
    date: String
  }
  
  type Team {
    id: ID!
    name: String
    users: [User]
    teamStats: [TeamStats]
  }
  
  type User {
    id: ID!
    rrAccountId: Int
    discordAccountId: Int
    userStats: [UserStats]
  }
  
  type TeamStats {
    matchId: Int
    points: Int
  }
  
  type UserStats {
    matchesWon: Int
    timePlayed: Int
    seasonsPlayed: Int
  }

  # RR REST API TYPES
  # Accounts
  type AccountInfo {
    accountId: Int!
    username: String!
    displayName: String!
    profileImage: String
    bannerImage: String
    isJunior: Boolean
    platforms: Int
    createdAt: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    leagues: [League]
    accountInfo(username: String!): AccountInfo
  }
`;

//const cache = {};any

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        leagues: () => leagues,
        accountInfo: async (_,{username = ''}) => {
          console.log(`Username ${username}`);
          const response = await fetch("https://accounts.rec.net/account?username=" + username);
          const data = await response.json();
          return data;
        },
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});