// @ts-check

/**
 * Reference:
 * - https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md
 */

const {
  aceVimMap,
  mapkey,
  imap,
  iunmap,
  imapkey,
  getClickableElements,
  vmap,
  vmapkey,
  map,
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
 * @param f {() => void}
 * @param [handle] {(e: unknown) => void}
 * @returns {() => void}
 */
const safeRun = (f, handle) => {
  return () => {
    /** @param e {unknown} */
    const defaultHandle = (e) => alert(`Error: ${e}`)
    try {
      return f()
    } catch (e) {
      return (handle ?? defaultHandle)(e)
    }
  }
}

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
  mapkey(
    '<Ctrl-1>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 1 }, (res) => alert(res)))
  )
  mapkey(
    '<Ctrl-2>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 2 }, (res) => alert(res)))
  )
  mapkey(
    '<Ctrl-3>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 3 }))
  )
  mapkey(
    '<Ctrl-4>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 4 }))
  )
  mapkey(
    '<Ctrl-5>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 5 }))
  )
  mapkey(
    '<Ctrl-6>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 6 }))
  )
  mapkey(
    '<Ctrl-7>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 7 }))
  )
  mapkey(
    '<Ctrl-8>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 8 }))
  )
  mapkey(
    '<Ctrl-9>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 9 }))
  )
  mapkey(
    '<Ctrl-0>',
    '',
    safeRun(() => RUNTIME('focusTabByIndex', { index: 10 }))
  )

  map('F', 'af')
  map('d', 'x')
  map('<Ctrl-w>', 'x') // Browser's default shortcut

  mapkey(
    'gh',
    'open link google',
    safeRun(() => openLink('https://google.co.jp'))
  )
  mapkey(
    'gH',
    'tab open link google',
    safeRun(() => tabOpenLink('https://google.co.jp'))
  )
  mapkey(
    'u',
    '#3Restore closed tab',
    safeRun(() => RUNTIME('openLast'))
  )
  mapkey(
    'H',
    '#4Go back in history',
    safeRun(() => history.go(-1)),
    {
      repeatIgnore: true,
    }
  )
  mapkey(
    'L',
    '#4Go forward in history',
    safeRun(() => history.go(1)),
    {
      repeatIgnore: true,
    }
  )
  mapkey(
    'o',
    '#8Open a URL in current tab',
    safeRun(() =>
      Front.openOmnibar({
        type: 'URLs',
        extra: 'getAllSites',
        tabbed: false,
      })
    )
  )
  mapkey(
    'b',
    'Select tabs',
    safeRun(() =>
      Front.openOmnibar({
        type: 'URLs',
        extra: 'getAllSites',
        tabbed: true,
      })
    )
  )
  mapkey(
    '<',
    'move tab -1',
    safeRun(() => RUNTIME('moveTab', { step: -1 }))
  )
  mapkey(
    '>',
    'move tab +1',
    safeRun(() => RUNTIME('moveTab', { step: 1 }))
  )
  mapkey(
    'Q',
    'Open SurfingKeys settings',
    safeRun(() => tabOpenLink('/pages/options.html'))
  )
  mapkey(
    'R',
    'Reload with nocache',
    safeRun(() => RUNTIME('reloadTab', { nocache: true }))
  )
  mapkey(
    '<Ctrl-p>',
    'previousTab',
    safeRun(() => RUNTIME('previousTab'))
  )
  mapkey(
    '<Ctrl-n>',
    'nextTab',
    safeRun(() => RUNTIME('nextTab'))
  )
} catch (e) {
  alert(`In the section 'Normal mode': ${e}`)
}

/**
 * Insert mode
 */
try {
  // Copied from ./Surfingkeys/src/content_scripts/common/insert.js
  function getRealEdit(event) {
    var rt = event ? event.target : document.activeElement
    // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
    while (rt && rt.shadowRoot) {
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

  imap('<Ctrl-[>', '<Esc>')
  imap('<Ctrl-l>', '<Esc>')
  imap('<Ctrl-a>', '<Home>')
  imap('<Ctrl-e>', '<End>')
  imapkey(
    '<Ctrl-b>',
    'Move cursor left',
    safeRun(() => {
      const activeElement = document.activeElement
      if (activeElement.selectionStart < activeElement.value.length) {
        activeElement.selectionStart += 1
        activeElement.selectionEnd = activeElement.selectionStart
      }
    })
  )
  imapkey(
    '<Ctrl-f>',
    'Move cursor right',
    safeRun(() => moveCursor('right', 'character'))
  )
  imapkey(
    '<Ctrl-p>',
    'Move cursor up',
    safeRun(() => {
      console.log('poi:', getRealEdit)
    })
  )
  imapkey(
    '<Ctrl-n>',
    'Move cursor down',
    safeRun(() =>
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          code: 'ArrowUp',
        })
      )
    )
  )
  imapkey('<Ctrl-g>', 'Edit in the editor', safeRun(editInEditor))
  iunmap('<Ctrl-i>')
  iunmap(':') // Emoji completion
  imapkey('<Ctrl-w>', 'Delete a left word', safeRun(deleteLeftWord)) // TODO: Didn't work
  imap('<Ctrl-h>', '<Backspace>') // TODO: Didn't work
} catch (e) {
  alert(`In the section 'Insert mode': ${e}`)
}

function deleteLeftWord() {
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

function deleteLeftChar() {
  document.getSelection().modify('extend', 'backward', 'character')
}

/**
 * Visual mode
 */
try {
  // TODO: Enable this when api to be providing this.
  // vmap("<Ctrl-[>", "<Esc>");
  // vmap("<Ctrl-l>", "<Esc>");
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
 * The vim editor
 */

aceVimMap('<Ctrl-j><Ctrl-k>', ':w<CR>', 'normal')

aceVimMap('<Ctrl-[>', '<Esc>', 'insert')
aceVimMap('<Ctrl-j><Ctrl-k>', '<Esc>:w<CR>', 'insert')
aceVimMap('<Ctrl-l>', '<Esc>', 'insert')

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
