
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    type: 'normal',
    id: 'copy-syosetu',
    title: '(Clipboard) 小説全体を読み上げ用にコピー',
    documentUrlPatterns: [
      'https://ncode.syosetu.com/**',
      'https://novel18.syosetu.com/**'
    ]
  })
})

chrome.contextMenus.onClicked.addListener((item) => {
  if (item.menuItemId === 'copy-syosetu') {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, ([activeTab]) => {
      chrome.tabs.sendMessage(activeTab.id, {
        method: 'copy-syosetu'
      })
    })
  }
})

function copyToClipboard(text) {
  const textArea = document.createElement('textarea')
  document.body.appendChild(textArea)

  textArea.value = text
  textArea.select()

  document.execCommand('copy')
  document.body.removeChild(textArea)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { method } = message
  console.log(`received message ${method} in background`)

  if (method === 'send-clipboard') {
    const { text } = message
    const tabId = sender.tab.id

    chrome.scripting.executeScript({
      target: {
        tabId: tabId
      },
      function: copyToClipboard,
      args: [text]
    })
  }

  return true
})
