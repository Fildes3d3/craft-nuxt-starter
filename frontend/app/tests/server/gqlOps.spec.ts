import { describe, it, expect } from 'vitest'
import { resolveGqlOp } from '~~/server/utils/gqlOps'

// /_gql is the only way the browser reaches Craft's GraphQL; it must refuse
// anything that is not a known operation with well-formed variables.
describe('resolveGqlOp (GraphQL allowlist)', () => {
  it('resolves a known operation without variables', () => {
    const gql = resolveGqlOp('home', undefined)
    expect(gql?.op).toBe('home')
    expect(gql?.query).toContain('query Home')
  })

  it('treats an empty variables object like none', () => {
    expect(resolveGqlOp('blogList', {})?.op).toBe('blogList')
  })

  it('resolves a detail operation with a valid slug as a GraphQL variable', () => {
    const gql = resolveGqlOp('blogPost', { slug: 'hello-world' })
    expect(gql?.variables).toEqual({ slug: 'hello-world' })
    expect(gql?.query).toContain('$slug')
    expect(gql?.query).not.toContain('hello-world')
  })

  it.each(['nope', '__proto__', 'constructor', 'toString', '', 42, null, undefined])('refuses unknown op %p', (op) => {
    expect(resolveGqlOp(op, undefined)).toBeNull()
  })

  it.each([
    '"){ users { email } }', '../admin', 'Hello', '-leading-dash', 'a'.repeat(129), 'with space', '',
  ])('refuses a malformed slug %p', (slug) => {
    expect(resolveGqlOp('page', { slug })).toBeNull()
  })

  it('refuses a detail op without a slug, with extra keys, or with non-object variables', () => {
    expect(resolveGqlOp('page', undefined)).toBeNull()
    expect(resolveGqlOp('page', { slug: 'ok', limit: 1000 })).toBeNull()
    expect(resolveGqlOp('page', 'ok')).toBeNull()
  })

  it('refuses variables on an operation that takes none', () => {
    expect(resolveGqlOp('home', { slug: 'x' })).toBeNull()
  })
})
