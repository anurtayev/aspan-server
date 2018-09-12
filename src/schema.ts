import { gql } from 'apollo-server'

export const typeDefs = gql`

scalar IntStringBoolean

type Attribute {
  name: String!
  value: IntStringBoolean!
}

type MetaData {
  tags: [String!]
  attributes: [Attribute!]
}

interface Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!
}

type Folder implements Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!

  children: [Entry!]
}

type File implements Entry {
  id: String!
  name: String!
  metaData: MetaData
  parentId: String!

  contentType: String
  size: Int!
}

type Query {
  getRootFolderEntries: [Entry!]
  getFolderEntries(id: String): [Entry!]
}

`
