// ── Shared ───────────────────────────────────────────────────────────────────

export interface CraftAsset {
  url: string
  alt: string | null
  width: number | null
  height: number | null
}

// ── Content blocks (matrix) ─────────────────────────────────────────────────
// `typeHandle` is the discriminant — narrow with
// `block.typeHandle === 'heroBlock'` and TypeScript infers the rest.

export interface HeroBlock {
  id: string
  typeHandle: 'heroBlock'
  heading: string
  text: string | null
}

export interface TextBlock {
  id: string
  typeHandle: 'textBlock'
  body: string
}

export interface ImageBlock {
  id: string
  typeHandle: 'imageBlock'
  image: CraftAsset[]
  caption: string | null
}

export type ContentBlock = HeroBlock | TextBlock | ImageBlock

// ── Entries ──────────────────────────────────────────────────────────────────

export interface PageEntry {
  title: string
  slug: string
  contentBlocks: ContentBlock[]
}

export interface PostSummary {
  title: string
  slug: string
  postDate: string
  excerpt: string | null
  image: CraftAsset[]
}

export interface PostEntry extends PostSummary {
  body: string | null
}

// ── Query payloads ───────────────────────────────────────────────────────────

export interface PageData { entry: PageEntry | null }
export interface BlogListData { entries: PostSummary[] }
export interface BlogPostData { entry: PostEntry | null }
