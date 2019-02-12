import { GraphQLScalarType, Kind } from 'graphql'
import { TAttributeType } from './types'

const coerceNumberStringBoolean = (value: TAttributeType) => {
  if (Array.isArray(value)) {
    throw new TypeError(
      `IntString cannot represent an array value: [${String(value)}]`
    )
  }
  const type = typeof value
  if (type === 'boolean' || type === 'number' || type === 'string') {
    return value
  }

  throw new Error(`[NumberStringBoolean] unsupported type: ${type}`)
}

// tslint:disable-next-line:variable-name
export const NumberStringBooleanInstance = new GraphQLScalarType({
  name: 'IntString',
  serialize: coerceNumberStringBoolean,
  parseValue: coerceNumberStringBoolean,
  parseLiteral: ast => {
    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
      return coerceNumberStringBoolean(ast.value)
    }

    if (ast.kind === Kind.STRING) {
      return ast.value
    }

    if (ast.kind === Kind.BOOLEAN) {
      return coerceNumberStringBoolean(ast.value)
    }

    return undefined
  }
})
