import { siteDataRef } from './data'
import { inBrowser } from '/@shared/config'

export { inBrowser }

/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
}

export function withBase(path: string) {
  return joinPath(siteDataRef.value.base, path)
}

/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path: string): string {
  let pagePath = path.replace(/\.html$/, '')
  pagePath = decodeURIComponent(pagePath)
  if (pagePath.endsWith('/')) {
    pagePath += 'index'
  }

  if (import.meta.env.DEV) {
    // always force re-fetch content in dev
    pagePath += `.md?t=${Date.now()}`
  } else {
    // in production, each .md file is built into a .md.js file following
    // the path conversion scheme.
    // /foo/bar.html -> ./foo_bar.md
    if (inBrowser) {
      const base = import.meta.env.BASE_URL
      pagePath = pagePath.slice(base.length).replace(/\//g, '_') + '.md'
      // client production build needs to account for page hash, which is
      // injected directly in the page's html
      const pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()]
      pagePath = `${base}assets/${pagePath}.${pageHash}.js`
    } else {
      // ssr build uses much simpler name mapping
      pagePath = `./${pagePath.slice(1).replace(/\//g, '_')}.md.js`
    }
  }

  return pagePath
}
