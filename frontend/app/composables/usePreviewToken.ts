/**
 * Reads the Craft CMS preview token from the current route's `?token` query
 * param and persists it in a short-lived cookie so it survives client-side
 * navigation within the same preview session.
 *
 * Returns a computed that yields null when no preview session is active.
 */
export const usePreviewToken = (): ComputedRef<string | null> => {
  const route = useRoute()

  const cookie = useCookie<string | null>('craft-preview-token', {
    // Short-lived on purpose: long enough for an editing session, short
    // enough that a stale token doesn't keep serving drafts.
    maxAge: 60 * 60, // 1 hour
    sameSite: 'lax',
    path: '/',
  })

  // Query values are string | string[] | null — normalize to a single token.
  const urlToken = computed<string | null>(() => {
    const raw = route.query.token
    const value = Array.isArray(raw) ? raw[0] : raw
    return value ?? null
  })

  // Persist a fresh URL token into the cookie. `immediate` covers the SSR
  // pass so subsequent client-side navigations still carry the token.
  watch(urlToken, (token) => {
    if (token) {
      cookie.value = token
    }
  }, { immediate: true })

  return computed(() => urlToken.value ?? cookie.value ?? null)
}
