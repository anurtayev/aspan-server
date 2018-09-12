import { GraphQLScalarType, Kind } from 'graphql'

const MAX_INT = 2147483647
const MIN_INT = -2147483648

const coerceIntStringBoolean = value => {
  if (Array.isArray(value)) {
    throw new TypeError(`IntString cannot represent an array value: [${String(value)}]`)
  }
  if (Number.isInteger(value)) {
    if (value < MIN_INT || value > MAX_INT) {
      throw new TypeError(`Value is integer but outside of valid range for 32-bit signed integer: ${String(value)}`)
    }
    return value
  }
  return String(value)
}

// tslint:disable-next-line:variable-name
export const IntStringBooleanInstance = new GraphQLScalarType({
  name: 'IntString',
  serialize: coerceIntStringBoolean,
  parseValue: coerceIntStringBoolean,
  parseLiteral: ast => {
    if (ast.kind === Kind.INT) {
      return coerceIntStringBoolean(parseInt(ast.value, 10))
    }

    if (ast.kind === Kind.STRING) {
      return ast.value
    }

    if (ast.kind === Kind.BOOLEAN) {
      return coerceIntStringBoolean(ast.value)
    }

    return undefined
  }
})
