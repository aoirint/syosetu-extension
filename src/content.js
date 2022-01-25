console.log(`iframe content script loaded: ${location.href}`)

chrome.runtime.onMessage.addListener(({method}, sender, sendResponse) => {
  console.log(`received message ${method} in iframe`)

  if (method === 'copy-syosetu') {
    const root = document.cloneNode(true)

    // 短編の場合
    const titleElm = root.querySelector('.novel_title')
    const title = titleElm ? titleElm.innerText : null

    // 連載の場合
    const novelNoElm = root.querySelector('#novel_no')
    
    let novelNoIndex = null
    if (novelNoElm) {
      const novelNo = novelNoElm.innerText
      novelNoIndex = novelNo.split('/')[0]
    }

    const subtitleElm = root.querySelector('.novel_subtitle')
    const subtitle = subtitleElm ? subtitleElm.innerText : null

    const removeEmptyParagraph = (root) => {
      Array.from(root.querySelectorAll('p')).forEach(pElm => {
        if (pElm.innerText === '') {
          const parent = pElm.parentNode
          parent.removeChild(pElm)
        }
      })
    }

    const replaceRubyToRubyText = (root) => {
      Array.from(root.querySelectorAll('ruby')).forEach(rubyElm => {
        const rubyTextElm = rubyElm.querySelector('rt')
  
        if (rubyTextElm) {
          const span = document.createElement('span')
          span.innerText = rubyTextElm.innerText

          const parent = rubyElm.parentNode
          parent.replaceChild(span, rubyElm)
        }
      })
    }

    const prefaceElm = root.querySelector('#novel_p')
    let preface = null
    if (prefaceElm) {
      replaceRubyToRubyText(prefaceElm)
      removeEmptyParagraph(prefaceElm)
      preface = prefaceElm.innerText
    }

    const honbunElm = root.querySelector('#novel_honbun')
    let honbun = null
    if (honbunElm) {
      replaceRubyToRubyText(honbunElm)
      removeEmptyParagraph(honbunElm)
      honbun = honbunElm.innerText
    }

    const appendixElm = root.querySelector('#novel_a')
    let appendix = null
    if (appendixElm) {
      replaceRubyToRubyText(appendixElm)
      removeEmptyParagraph(appendixElm)
      appendix = appendixElm.innerText
    }

    let text = ''
    if (novelNoIndex) {
      text += `第${novelNoIndex}部分\n`
      text += `\n`
    }
    if (title) {
      text += `${title}\n`
      text += `\n`
    }
    if (subtitle) {
      text += `${subtitle}\n`
      text += `\n`
    }
    if (preface) {
      text += `前書き開始\n`
      text += `${preface}\n`
      text += `前書き終了\n`
      text += `\n`
    }
    if (honbun) {
      text += `本文開始\n`
      text += `${honbun}\n`
      text += `本文終了\n`
      text += `\n`
    }
    if (appendix) {
      text += `後書き開始\n`
      text += `${appendix}\n`
      text += `後書き終了\n`
      text += `\n`
    }

    chrome.runtime.sendMessage({
      method: 'send-clipboard',
      text: text
    })
  }

  return true
})
