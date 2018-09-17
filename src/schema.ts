import { gql } from 'apollo-server'

export const typeDefs = gql`

scalar NumberStringBoolean

type MetaData {
  tags: [String!]
  attributes: [[NumberStringBoolean!]!]
}

interface Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!
  isFile: Boolean!
}

type Folder implements Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!
  isFile: Boolean!

  children: [Entry!]
}

type File implements Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!
  isFile: Boolean!

  contentType: String!
  size: Int!
}

type Query {
  getRootFolderEntries: [Entry!]
  getFolderEntries(id: String): [Entry!]
}

type Mutation {
  addTag(id: String, tag: String!): MetaData
  removeTag(id: String, tag: String!): MetaData
  addAttribute(id: String, attribute: [NumberStringBoolean!]!): MetaData
  removeAttribute(id: String, attributeKey: String!): MetaData
}

`
