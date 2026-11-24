// GraphQL operations for the starter's content model.
// Craft generates the schema from your sections/fields — explore it at
// http://localhost/admin → GraphQL → GraphiQL.
//
// Each operation has a name (`op`). To add one, write a builder here and
// register it in server/utils/gqlOps.ts — the browser can only run operations
// that are listed there.

import type { CraftGql } from './types'

const CONTENT_BLOCKS_FRAGMENT = /* GraphQL */ `
  contentBlocks {
    ... on heroBlock_Entry {
      id
      typeHandle
      heading
      text
    }
    ... on textBlock_Entry {
      id
      typeHandle
      body
    }
    ... on imageBlock_Entry {
      id
      typeHandle
      caption
      image {
        url
        alt
        width
        height
      }
    }
  }
`

/** Home single */
export function getHomeGql(): CraftGql {
  return {
    op: 'home',
    query: /* GraphQL */ `
      query Home {
        entry(section: "home") {
          title
          slug
          ... on page_Entry {
            ${CONTENT_BLOCKS_FRAGMENT}
          }
        }
      }
    `,
  }
}

/** A page from the Pages structure, by slug */
export function getPageGql(slug: string): CraftGql {
  return {
    op: 'page',
    query: /* GraphQL */ `
      query Page($slug: [String]) {
        entry(section: "pages", slug: $slug) {
          title
          slug
          ... on page_Entry {
            ${CONTENT_BLOCKS_FRAGMENT}
          }
        }
      }
    `,
    variables: { slug },
  }
}

/** Blog listing (newest first) */
export function getBlogListGql(): CraftGql {
  return {
    op: 'blogList',
    query: /* GraphQL */ `
      query BlogList {
        entries(section: "blog", orderBy: "postDate DESC") {
          title
          slug
          postDate
          ... on post_Entry {
            excerpt
            image {
              url
              alt
              width
              height
            }
          }
        }
      }
    `,
  }
}

/** A single blog post, by slug */
export function getBlogPostGql(slug: string): CraftGql {
  return {
    op: 'blogPost',
    query: /* GraphQL */ `
      query BlogPost($slug: [String]) {
        entry(section: "blog", slug: $slug) {
          title
          slug
          postDate
          ... on post_Entry {
            excerpt
            body
            image {
              url
              alt
              width
              height
            }
          }
        }
      }
    `,
    variables: { slug },
  }
}
