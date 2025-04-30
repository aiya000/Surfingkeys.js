// @ts-check

/**
 * Reference:
 * - https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md
 */

const {
  aceVimMap,
  mapkey: mapkey_,
  imap,
  iunmap,
  imapkey: imapkey_,
  getClickableElements,
  vmap,
  vmapkey: vmapkey_,
  map: nmap,
  unmap,
  cmap,
  addSearchAlias,
  removeSearchAlias,
  tabOpenLink,
  readText,
  Clipboard,
  Hints,
  Visual,
  RUNTIME,
  Front,
  Insert,
} = api

/**
 * Expose API for using in the browser console
 */
window.surfingkeys = api

/**
 * @template T
 * @param f {(...args: unknown[]) => T}
 * @param [handle] {(e: unknown) => T}
 * @returns {() => void}
 */
const safeRun = (f, handle) => () => {
  /** @param e {unknown} */
  const defaultHandle = (e) => alert(`Error: ${e}`)
  try {
    return f()
  } catch (e) {
    return (handle ?? defaultHandle)(e)
  }
}

/**
 * @template [T=unknown]
 * @typedef {(keys: string, jscode: (...args: unknown[]) => T, options?: object, annotation?: string) => void} MappingKey
 *
 * Arguments order arranged version of `typeof mapkey_`.
 */

/** @type {MappingKey} */
const nmapkey = (keys, jscode, options, annotation) =>
  mapkey_(keys, annotation ?? '', safeRun(jscode), options)

/** @type {MappingKey} */
const imapkey = (keys, jscode, options, annotation) =>
  imapkey_(keys, annotation ?? '', safeRun(jscode), options)

/** @type {MappingKey} */
const vmapkey = (keys, jscode, options, annotation) =>
  vmapkey_(keys, annotation ?? '', safeRun(jscode), options)

/**
 * @param message {string}
 * @returns {never}
 */
const raiseError = (message) => {
  throw new Error(message)
}

/**
 * General
 */
try {
  Hints.characters = 'wertuiopasdfghjkzxcvbm'
  settings.hintAlign = 'left'
} catch (e) {
  alert(`In the section 'General': ${e}`)
}

/**
 * Normal mode
 */
try {
  nmapkey('<Ctrl-1>', () =>
    RUNTIME('focusTabByIndex', { index: 1 }, alert)
  )
  nmapkey('<Ctrl-2>', () =>
    RUNTIME('focusTabByIndex', { index: 2 }, alert)
  )
  nmapkey('<Ctrl-3>', () => RUNTIME('focusTabByIndex', { index: 3 }))
  nmapkey('<Ctrl-4>', () => RUNTIME('focusTabByIndex', { index: 4 }))
  nmapkey('<Ctrl-5>', () => RUNTIME('focusTabByIndex', { index: 5 }))
  nmapkey('<Ctrl-6>', () => RUNTIME('focusTabByIndex', { index: 6 }))
  nmapkey('<Ctrl-7>', () => RUNTIME('focusTabByIndex', { index: 7 }))
  nmapkey('<Ctrl-8>', () => RUNTIME('focusTabByIndex', { index: 8 }))
  nmapkey('<Ctrl-9>', () => RUNTIME('focusTabByIndex', { index: 9 }))
  nmapkey('<Ctrl-0>', () => RUNTIME('focusTabByIndex', { index: 10 }))

  nmap('F', 'af')
  nmap('d', 'x')

  nmapkey('gh', () => openLink('https://google.co.jp'))
  nmapkey('gH', () => tabOpenLink('https://google.co.jp'))
  nmapkey('u', () => RUNTIME('openLast'))
  nmapkey('H', () => history.go(-1), { repeatIgnore: true })
  nmapkey('L', () => history.go(1), { repeatIgnore: true })
  nmapkey('o', () =>
    Front.openOmnibar({
      type: 'URLs',
      extra: 'getAllSites',
      tabbed: false,
    })
  )
  nmapkey('b', () =>
    Front.openOmnibar({
      type: 'URLs',
      extra: 'getAllSites',
      tabbed: true,
    })
  )
  nmapkey('<', () => RUNTIME('moveTab', { step: -1 }))
  nmapkey('>', () => RUNTIME('moveTab', { step: 1 }))
  nmapkey('Q', () => tabOpenLink('/pages/options.html')) // Open SurfingKeys setting page
  nmapkey('R', () => RUNTIME('reloadTab', { nocache: true }))
  nmapkey('<Ctrl-p>', () => RUNTIME('previousTab'))
  nmapkey('<Ctrl-n>', () => RUNTIME('nextTab'))
} catch (e) {
  alert(`In the section 'Normal mode': ${e}`)
}

/**
 * Insert mode
 */
try {
  /**
   * Copied from `./Surfingkeys/src/content_scripts/common/insert.js`.
   * @param [event] {Event}
   */
  const getRealEdit = (event) => {
    let rt = event ? event.target : document.activeElement
    // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
    while (rt?.shadowRoot) {
      if (rt.shadowRoot.activeElement) {
        rt = rt.shadowRoot.activeElement
      } else if (rt.shadowRoot.querySelector('input, textarea, select')) {
        rt = rt.shadowRoot.querySelector('input, textarea, select')
        break
      } else {
        break
      }
    }
    if (rt === window) {
      rt = document.body
    }
    return rt
  }

  /**
   * @param direction {string}
   * @param granularity {string}
   * @returns {void}
   */
  const moveCursor = (direction, granularity) =>
    document.getSelection()?.modify('move', direction, granularity) ??
    raiseError('No selection found')

  const editInEditor = () => {
    const element = getRealEdit()
    element.blur()
    Insert.exit()
    Front.showEditor(element)
  }

  const deleteLeftWord = () => {
    const element = getRealEdit()

    if (element.setSelectionRange !== undefined) {
      const pos = deleteNextWord(element.value, -1, element.selectionStart)
      element.value = pos[0]
      element.setSelectionRange(pos[1], pos[1])
      return
    }

    // for contenteditable div
    const selection = document.getSelection()
    const p0 = selection.focusOffset
    document.getSelection().modify('move', 'backward', 'word')
    const v = selection.focusNode.data
    const p1 = selection.focusOffset
    selection.focusNode.data = v.substr(0, p1) + v.substr(p0)
    selection.setPosition(selection.focusNode, p1)
  }

  const deleteLeftChar = () =>
    document.getSelection()
      ?.modify('extend', 'backward', 'character')
      ?? alert('No selection found')

  imap('<Ctrl-[>', '<Esc>')
  imap('<Ctrl-l>', '<Esc>')
  imap('<Ctrl-a>', '<Home>')
  imap('<Ctrl-e>', '<End>')
  imapkey('<Ctrl-b>', () => {
    const activeElement = document.activeElement
    if (activeElement.selectionStart < activeElement.value.length) {
      activeElement.selectionStart += 1
      activeElement.selectionEnd = activeElement.selectionStart
    }
  })
  imapkey('<Ctrl-f>', () =>
    moveCursor('right', 'character')
  )
  imapkey('<Ctrl-p>', () => console.log('poi:', getRealEdit))
  imapkey('<Ctrl-n>', () =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        code: 'ArrowUp',
      })
    )
  )
  imapkey('<Ctrl-g>', editInEditor)
  imap('<Ctrl-h>', '<Backspace>') // TODO: Didn't work

  iunmap('<Ctrl-i>')
  iunmap(':') // Emoji completion
  imapkey('<Ctrl-w>', 'Delete a left word', deleteLeftWord) // TODO: Didn't work
} catch (e) {
  alert(`In the section 'Insert mode': ${e}`)
}

/**
 * Visual mode
 */
try {
  // TODO: Enable this
  // vmap('<Ctrl-[>', '<Esc>')
  // vmap('<Ctrl-l>', '<Esc>')
} catch (e) {
  alert(`In the section 'Visual mode': ${e}`)
}

/**
 * Command mode
 */
try {
  cmap('<Ctrl-[>', '<Esc>')
  cmap('<Ctrl-l>', '<Esc>')

  cmap('<Ctrl-a>', '<Home>')
  cmap('<Ctrl-e>', '<End>')
  cmap('<Ctrl-b>', '<Left>')
  cmap('<Ctrl-f>', '<Right>')

  cmap('<Ctrl-w>', '')
  cmap('<Ctrl-h>', '<Alt-h>')
  // cmap('<Ctrl-d>', '?');
  cmap('<Ctrl-u>', '')
  cmap('<Ctrl-k>', '')
} catch (e) {
  alert(`In the section 'Command mode': ${e}`)
}

/**
 * Vim editor
 */
try {
  aceVimMap('<Ctrl-j><Ctrl-k>', ':w<CR>', 'normal')

  aceVimMap('<Ctrl-[>', '<Esc>', 'insert')
  aceVimMap('<Ctrl-j><Ctrl-k>', '<Esc>:w<CR>', 'insert')
  aceVimMap('<Ctrl-l>', '<Esc>', 'insert')
} catch (e) {
  alert(`In the section 'Vim editor': ${e}`)
}

/**
 * Styles
 */
settings.theme = `
  .sk_theme {
    font-family: Input Sans Condensed, Charcoal, sans-serif;
    font-size: 10pt;
    background: #24272e;
    color: #abb2bf;
  }

  .sk_theme tbody {
    color: #fff;
  }

  .sk_theme input {
    color: #d0d0d0;
  }

  .sk_theme .url {
    color: #61afef;
  }

  .sk_theme .annotation {
    color: #56b6c2;
  }

  .sk_theme .omnibar_highlight {
    color: #528bff;
  }

  .sk_theme .omnibar_timestamp {
    color: #e5c07b;
  }

  .sk_theme .omnibar_visitcount {
    color: #98c379;
  }

  .sk_theme #sk_omnibarSearchResult > ul > li:nth-child(odd) {
    background: #303030;
  }

  .sk_theme #sk_omnibarSearchResult > ul > li.focused {
    background: #3e4452;
  }

  #sk_status, #sk_find {
    font-size: 20pt;
  }
`
