/** Room left between a revealed element and a pinned bar (px). */
const GAP = 8

/**
 * scrollIntoView({ block: 'nearest' }), then make sure the element is not
 * hidden under the pinned top bar or bottom action bar (phones scroll the
 * page; `scroll-margin` is not applied to 'nearest' in every browser).
 * Without those bars (desktop, tablet) this is a plain scrollIntoView.
 */
export function revealElement(el: Element | null) {
  if (!el) return
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  const top = document.querySelector('.topbar-compact')?.getBoundingClientRect().bottom ?? 0
  const bottom = document.querySelector('.action-bar')?.getBoundingClientRect().top ?? window.innerHeight
  const r = el.getBoundingClientRect()
  if (r.top < top + GAP) window.scrollBy(0, r.top - top - GAP)
  else if (r.bottom > bottom - GAP) window.scrollBy(0, Math.min(r.bottom - bottom + GAP, r.top - top - GAP))
}
