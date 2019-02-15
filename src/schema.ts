import { gql } from 'apollo-server'

export const typeDefs = gql`
  scalar NumberStringBoolean

  type MetaData {
    tags: [String!]
    attributes: [[NumberStringBoolean!]!]
    title: String
    description: String
  }

  interface Entry {
    id: String!
    name: String!
    metaData: MetaData
    parentId: String!
    type: String!
  }

  type Folder implements Entry {
    id: String!
    name: String!
    metaData: MetaData
    parentId: String!
    type: String!

    children: [Entry!]
  }

  type File implements Entry {
    id: String!
    name: String!
    metaData: MetaData
    parentId: String!
    type: String!

    contentType: String!
    size: Int!
    image: String!
    thumbImage: String
  }

  type Query {
    getRootFolderEntries: [Entry!]
    getFolderEntries(id: String!): [Entry!]
  }

  type Mutation {
    addTag(id: String!, tag: String!): MetaData
    removeTag(id: String!, tag: String!): MetaData
    addAttribute(id: String!, attribute: [NumberStringBoolean!]!): MetaData
    removeAttribute(id: String!, attributeKey: String!): MetaData
  }
`
