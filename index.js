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
  # =====================================
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
    bio: AccountBio
  }

  type AccountBio {
    accountId: Int!
    bio: String
  }

  type Query {
    leagues: [League]
    getRRAccountInfoFromUser(username: String): AccountInfo
    getRRAccountInfoFromId(accountId: Int): AccountInfo
  }
`;

//const cache = {};any

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        leagues: () => leagues,
        getRRAccountInfoFromUser: async (_,{username = 'coach'}) => {
          const response = await fetch(`https://accounts.rec.net/account?username=${username}`);
          const data = await response.json();
          return data;
        },
        getRRAccountInfoFromId: async (_,{accountId = 1}) => {
          const response = await fetch(`https://accounts.rec.net/account/${accountId}`);
          const data = await response.json();
          return data;
        },
    },
    AccountInfo: {
      bio: async (parent) => {
        const response = await fetch(`https://accounts.rec.net/account/${parent.accountId}/bio`);
        const data = await response.json();
        return data;
      }
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});