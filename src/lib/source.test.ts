import { describe, expect, it } from 'vitest'
import { shortCitation } from './source'

describe('shortCitation', () => {
  it('keeps author, year and licence of a long dataset citation', () => {
    const c =
      'Mojahid et al. (2025), Intelligent recognition of subsurface utilities and voids using ground-penetrating radar and deep learning techniques: Data of GPR profiles images, Mendeley Data, DOI 10.17632/ww7fd9t325.1. Licence: CC BY 4.0.'
    expect(shortCitation(c)).toBe('Mojahid et al. (2025) · CC BY 4.0')
  })

  it('leaves a short citation without "Author (year)" unchanged', () => {
    expect(shortCitation('Simulated with gprMax (Warren et al. 2016)')).toBe('Simulated with gprMax (Warren et al. 2016)')
  })

  it('drops the licence part when there is none', () => {
    expect(shortCitation('Doe (2020), Some data, Zenodo.')).toBe('Doe (2020)')
  })
})
