import { gql } from "apollo-server"

const schema = gql`
  type TMetaData {
    tags: string[]
    description: string
    title: string
  }


  type TEntry {
    id!: string
    isFile!: boolean
    name!: string
    contentType!: EContentType
    metaData: TMetaData
    entries: TEntry[]
  }

  type Query {
    books: [Book]
  }
`

export default schema
