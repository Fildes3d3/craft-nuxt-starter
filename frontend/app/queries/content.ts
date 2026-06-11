// GraphQL documents for the starter's content model.
// Craft generates the schema from your sections/fields — explore it at
// http://localhost/admin → GraphQL → GraphiQL.

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
export const homeGql = /* GraphQL */ `
  query Home {
    entry(section: "home") {
      title
      slug
      ... on page_Entry {
        ${CONTENT_BLOCKS_FRAGMENT}
      }
    }
  }
`

/** A page from the Pages structure, by slug */
export const pageGql = /* GraphQL */ `
  query Page($slug: [String]) {
    entry(section: "pages", slug: $slug) {
      title
      slug
      ... on page_Entry {
        ${CONTENT_BLOCKS_FRAGMENT}
      }
    }
  }
`

/** Blog listing (newest first) */
export const blogListGql = /* GraphQL */ `
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
`

/** A single blog post, by slug */
export const blogPostGql = /* GraphQL */ `
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
`
