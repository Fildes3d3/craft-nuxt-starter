import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ContentBlocks from '~/components/ContentBlocks.vue'
import type { HeroBlock, TextBlock, ImageBlock } from '~/types/content'

// Fixtures use the narrow block types (not the ContentBlock union) so that
// spreads like `{ ...heroBlock, text: null }` keep their discriminant.
const heroBlock: HeroBlock = {
  id: 'block-1',
  typeHandle: 'heroBlock',
  heading: 'Big headline',
  text: 'Supporting copy',
}

const textBlock: TextBlock = {
  id: 'block-2',
  typeHandle: 'textBlock',
  body: '<h2>Section</h2><p>Rich <strong>text</strong> content.</p>',
}

const imageBlock: ImageBlock = {
  id: 'block-3',
  typeHandle: 'imageBlock',
  image: [{ url: 'http://localhost/uploads/cat.jpg', alt: 'A cat', width: 800, height: 600 }],
  caption: 'A very good cat',
}

describe('ContentBlocks', () => {
  it('renders a hero block with heading and text', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [heroBlock] },
    })

    expect(wrapper.find('h1').text()).toBe('Big headline')
    expect(wrapper.text()).toContain('Supporting copy')
  })

  it('omits hero text paragraph when text is null', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [{ ...heroBlock, text: null }] },
    })

    expect(wrapper.find('h1').text()).toBe('Big headline')
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('renders text block HTML via v-html', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [textBlock] },
    })

    expect(wrapper.find('.prose-body h2').text()).toBe('Section')
    expect(wrapper.find('.prose-body strong').text()).toBe('text')
  })

  it('renders an image block with src, alt, and caption', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [imageBlock] },
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('http://localhost/uploads/cat.jpg')
    expect(img.attributes('alt')).toBe('A cat')
    expect(wrapper.find('figcaption').text()).toBe('A very good cat')
  })

  it('skips an image block whose asset array is empty', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [{ ...imageBlock, image: [] }] },
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders multiple blocks in order', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [heroBlock, textBlock, imageBlock] },
    })

    const html = wrapper.html()
    expect(html.indexOf('Big headline')).toBeLessThan(html.indexOf('Section'))
    expect(html.indexOf('Section')).toBeLessThan(html.indexOf('figcaption'))
  })

  it('renders nothing for an empty block list', async () => {
    const wrapper = await mountSuspended(ContentBlocks, {
      props: { blocks: [] },
    })

    expect(wrapper.find('section').exists()).toBe(false)
    expect(wrapper.find('figure').exists()).toBe(false)
  })
})
