import { ApolloServer, gql } from 'apollo-server'
import * as dotenv from 'dotenv'
// import * as assert from 'assert'

dotenv.config()
// const path = process.env.REPOSITORY_PATH as string
// const metaFolderName = process.env.META_FOLDER as string || '.metaFolder'
// assert(path, 'configuration error: repository path is missing')

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
  }
`

const resolvers = {
  Query: {
    books: () => ''
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
}).catch((reason) => {
  console.log(reason)
})
