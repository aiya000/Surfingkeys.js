// @ts-check
/* eslint no-implicit-any: 0 */

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
  unmap: nunmap,
  cmap,
  addSearchAlias,
  removeSearchAlias,
  tabOpenLink,
  readText,
  Clipboard,
  Hints,
  Visual,
  Normal,
  RUNTIME,
  Front,
  Insert,
} = api

/**
 * Expose API for using in the browser console
 */
window.surfingkeys = api

console.log('poi:', 'Surfingkeys reloaded at:', new Date().toLocaleString())

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
  nmapkey('<Ctrl-1>', () => RUNTIME('focusTabByIndex', { index: 1 }, alert))
  nmapkey('<Ctrl-2>', () => RUNTIME('focusTabByIndex', { index: 2 }, alert))
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
  nmapkey('p', () =>
    Clipboard.read((response) => {
      location.href = response.data
    })
  )
  nmapkey('<Ctrl-p>', () => RUNTIME('previousTab'))
  nmapkey('<Ctrl-n>', () => RUNTIME('nextTab'))
  nmapkey('<Ctrl-f>', () => Normal.scroll('pageDown'), { repeatIgnore: true })
  nmapkey('<Ctrl-b>', () => Normal.scroll('pageUp'), { repeatIgnore: true })
} catch (e) {
  alert(`In the section 'Normal mode': ${e}`)
}

/**
 * Insert mode
 */
try {
  /**
   * @typedef {HTMLInputElement | HTMLTextAreaElement} EditableHTMLElement
   */

  /**
   * @typedef {Object} CharacterMovement
   * @property {'character'} granularity
   * @property {'left' | 'right'} direction
   */

  /**
   * @typedef {Object} LineMovement
   * @property {'line'} granularity
   * @property {'backward' | 'forward'} direction
   */

  /**
   * @typedef {CharacterMovement | LineMovement} Movement
   */

  /**
   * @param element {Element}
   * @returns {element is EditableHTMLElement}
   */
  const isEditableElement = (element) =>
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement

  /**
   * @param element {Element}
   * @returns {asserts element is EditableHTMLElement}
   */
  const assertElementIsEditable = (element) => {
    if (!isEditableElement(element)) {
      throw new Error('Not an editable element')
    }
  }

  /**
   * NOTE: on some pages like `chrome://history/`, input is in shadowRoot of several other recursive shadowRoots.
   * @see {@link getRealEdit}
   * @param element {Element}
   */
  const getRealTarget = (element) => {
    // If no shadowRoot exists
    if (element.shadowRoot === null) {
      return element
    }

    // If shadowRoot is active
    if (element.shadowRoot.activeElement !== null) {
      return getRealTarget(element.shadowRoot.activeElement)
    }

    // If an editable element exists in shadowRoot
    const anotherEditable = element.shadowRoot.querySelector('input, textarea, select')
    if (anotherEditable !== null) {
      return anotherEditable
    }

    throw new Error('No editable element found')
  }

  /**
   * @see {@link getRealEdit}
   * @param event {Event}
   */
  const getEventTargetElement = (event) => {
    if (event.target instanceof Element) {
      return event.target
    }
    throw new TypeError('event.target is not an Element')
  }

  /**
   * @param [event] {Event}
   * @returns The editable real (actual) element
   */
  const getRealEdit = (event) => {
    const source = event
      ? getEventTargetElement(event)
      : document.activeElement ?? raiseError('No active element found')
    const realTarget = getRealTarget(source)

    // If realTarget is an exact editable element
    if (!(realTarget instanceof Window)) {
      assertElementIsEditable(realTarget) // anotherEditable may not be an editable element, but should be
      return realTarget
    }

    // Try recovering something beacause no editable element found
    const anotherEditable = document.body
    assertElementIsEditable(anotherEditable) // anotherEditable may not be an editable element, but should be
    return anotherEditable
  }

  /**
   * @typedef {Object} CursorPosition
   * @property {number} selectionStart
   * @property {number} selectionEnd
   */

  /**
   * @param element {EditableHTMLElement}
   * @returns {element is CursorPosition}
    */
  const isCursorPosition = (element) =>
    element.selectionStart !== null &&
    element.selectionEnd !== null

  /**
   * @see {@link moveCursorAtActiveElement}
   * @param activeElement {EditableHTMLElement & CursorPosition} -- EditableHTMLElement but .selectionStart and selectionEnd are not nullable
   * @param direction {'left' | 'right'}
   */
  const moveLeftOrRightAtActiveElement = (
    activeElement,
    direction
  ) => {
    try {
      if (direction === 'right') {
        activeElement.selectionStart += 1
        return
      }

      if (activeElement.selectionStart > 0) {
        activeElement.selectionStart -= 1
      }

      throw new Error('unreachable')
    } finally {
      activeElement.selectionEnd = activeElement.selectionStart
    }
  }

  const moveDown = (element) => {
    // 現在のカーソル位置を取得
    const start = element.selectionStart;
    const text = element.value;

    // 現在の行の終わりを見つける
    const currentLineEnd = text.indexOf('\n', start);
    if (currentLineEnd === -1) {
      // もう次の行がない場合は末尾へ
      element.selectionStart = element.selectionEnd = text.length;
      return;
    }

    // 次の行の同じ列位置を計算
    const currentLineStart = text.lastIndexOf('\n', start - 1) + 1;
    const column = start - currentLineStart;

    // 次の行の開始位置
    const nextLineStart = currentLineEnd + 1;

    // 次の行の終わり
    const nextLineEnd = text.indexOf('\n', nextLineStart);
    const nextLineLength = (nextLineEnd === -1 ? text.length : nextLineEnd) - nextLineStart;

    // 次の行の同じ列位置か、行の長さによる制限位置に移動
    const newPosition = nextLineStart + Math.min(column, nextLineLength);
    element.selectionStart = element.selectionEnd = newPosition;
  };

  /**
   * @see {@link moveCursor}
   * @param activeElement {EditableHTMLElement}
   * @param movement {Movement}
   */
  const moveCursorAtActiveElement = (
    activeElement,
    movement
  ) => {
    if (!isCursorPosition(activeElement)) {
      throw new Error('No selection found')
    }

    switch (movement.granularity) {
      case 'character': {
        moveLeftOrRightAtActiveElement(
          activeElement,
          movement.direction,
        )
        break
      }
      case 'line':
        switch (movement.direction) {
          case 'backward':
            activeElement.setSelectionRange(
              activeElement.selectionStart - 1,
              activeElement.selectionEnd - 1
            )
            break
          case 'forward':
            activeElement.setSelectionRange(
              activeElement.selectionStart + 1,
              activeElement.selectionEnd + 1
            )
            break
          default: {
            /** @type {never} */
            const satisfied = movement
            throw new Error(`unreachable: ${satisfied}`)
          }
        }
        break
      default: {
        /** @type {never} */
        const satisfied = movement
        throw new Error(`unreachable: ${satisfied}`)
      }
    }
  }

  /**
   * @param movement {Movement}
   */
  const moveCursor = (movement) => {
    const activeElement = getRealEdit()
    if (activeElement === null) {
      const { direction, granularity } = movement
      document.getSelection()
        ?.modify('move', direction, granularity)
        ?? raiseError('No selection found')
    } else {
      moveCursorAtActiveElement(activeElement, movement)
    }
  }

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

    // for content editable div
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
      ?? raiseError('No selection found')

  imap('<Ctrl-[>', '<Esc>')
  imap('<Ctrl-l>', '<Esc>')
  imap('<Ctrl-a>', '<Home>')
  imap('<Ctrl-e>', '<End>')
  imapkey('<Ctrl-b>', () => moveCursor('left', 'character'))
  imapkey('<Ctrl-f>', () => moveCursor('right', 'character'))
  imapkey('<Ctrl-p>', () => moveCursor('up', 'line'))
  imapkey('<Ctrl-n>', () => {
    const activeElement = getRealEdit()
    try {
      activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
        })
      )
    } catch (e) {
      console.error('Error dispatching ArrowDown:', e)
    }
  })
  imapkey('<Ctrl-g>', editInEditor)
  imap('<Ctrl-h>', '<Backspace>') // TODO: Didn't work

  // 行末までを削除する
  imapkey(
    '<Ctrl-k>',
    () => {
      const element = getRealEdit()
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        // input や textarea 要素の場合
        const start = element.selectionStart || 0
        const end = element.value.indexOf('\n', start)
        const lineEnd = end === -1 ? element.value.length : end

        // 現在位置から行末までを選択して削除
        const newValue =
          element.value.substring(0, start) + element.value.substring(lineEnd)
        element.value = newValue
        element.selectionStart = start
        element.selectionEnd = start
      } else {
        // contenteditable などの場合
        try {
          const selection = document.getSelection()
          if (selection) {
            // 現在位置から行末まで選択
            selection.modify('extend', 'forward', 'lineboundary')
            // 選択範囲を削除
            document.execCommand('delete')
          }
        } catch (e) {
          console.error('Error deleting to end of line:', e)
        }
      }
    },
    {},
    'Delete to end of line'
  )

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
