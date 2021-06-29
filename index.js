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
  type UserInfo {
    accountId: Int!
    username: String!
    displayName: String!
    profileImage: String
    bannerImage: String
    isJunior: Boolean
    platforms: Int
    createdAt: String
    bio: UserBio
    rooms: [Room]
    events: [Event]
  }

  type UserBio {
    accountId: Int!
    bio: String
  }

  type Event {
    PlayerEventId: Int!
    CreatorPlayerId: Int!
    ImageName: String
    RoomId: Int
    SubRoomId: Int
    ClubId: Int
    Name: String
    Description: String
    StartTime: String
    EndTime: String
    AttendeeCount: Int
    State: Int
    Accessibility: Int
  }

  type Room {
    RoomId: Int!
    IsDorm: Boolean!
    MaxPlayerCalculationMode: Int!
    MaxPlayers: Int!
    CloningAllowed: Boolean!
    DisableMicAutoMute: Boolean!
    DisableRoomComments: Boolean!
    EncryptVoiceChat: Boolean!
    LoadScreenLocked: Boolean!
    Name: String!
    Description: String
    ImageName: String
    WarningMask: Int
    CustomWarning: String
    CreatorAccountId: Int!
    State: Int
    Accessibility: Int
    SupportsLevelVoting: Boolean
    IsRRO: Boolean
    SupportsScreens: Boolean
    SupportsWalkVR: Boolean
    SupportsTeleportVR: Boolean
    SupportsVRLow: Boolean
    SupportsQuest2: Boolean
    SupportsMobile: Boolean
    SupportsJuniors: Boolean
    MinLevel: Int
    CreatedAt: String
    Stats: RoomStats
  }

  type RoomStats {
    CheerCount: Int
    FavoriteCount: Int
    VisitorCount: Int
    VisitCount: Int
  }

  type Query {
    leagues: [League]
    accountInfoFromUsername(username: String): UserInfo
    accountInfoFromId(accountId: Int): UserInfo
  }
`;

//const cache = {};any

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    leagues: () => leagues,
    accountInfoFromUsername: async (_, { username = 'Coach' }) => {
      const response = await fetch(`https://accounts.rec.net/account?username=${username}`);
      const data = await response.json();
      return data;
    },
    accountInfoFromId: async (_, { accountId = 1 }) => {
      const response = await fetch(`https://accounts.rec.net/account/${accountId}`);
      const data = await response.json();
      return data;
    },
  },
  UserInfo: {
    bio: async (parent) => {
      const response = await fetch(`https://accounts.rec.net/account/${parent.accountId}/bio`);
      const data = await response.json();
      return data;
    },
    rooms: async (parent) => {
      const response = await fetch(`https://rooms.rec.net/rooms/ownedby/${parent.accountId}`);
      const data = await response.json();
      return data;
    },
    events: async (parent) => {
      const response = await fetch(`https://api.rec.net/api/playerevents/v1/creator/${parent.accountId}`);
      const data = await response.json();
      return data;
    },
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});