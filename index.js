const md = markdownit({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch (__) {}
    }

    return '' // use external default escaping
  },
})
const keys = window.tinykeys

const urlParams = new URLSearchParams(window.location.search)
const contentUrl = urlParams.get('url')

function renderMarkdown(doc) {
  const result = md.render(doc)
  const content = document.getElementById('content')
  content.innerHTML = result
}

const hello = document.getElementById('hello')
const present = document.getElementById('present')
function showHello() {
  hello.style.display = 'flex'
  present.style.display = 'none'
}
function showPresentation() {
  hello.style.display = 'none'
  present.style.display = 'block'
}

function startPresentation(content) {
  showPresentation()
  renderMarkdown(content)
}

if (contentUrl !== null) {
  if (contentUrl == '_file') {
    startPresentation(localStorage.getItem('content'))
    document.getElementById("raw").setAttribute("href", "#")
  } else {
    fetch(contentUrl)
      .then((data) => data.text())
      .then((content) => {
        // update link for raw text
        document.getElementById("raw").setAttribute("href", contentUrl)
        startPresentation(content)
      })
      .catch(() => {
        alert('Unable to present document. Make sure the link is valid.')
        showHello()
      })
  }
} else {
  showHello()
}

const presentButton = document.getElementById('present-button')
presentButton.onclick = () => {
  const presentLink = document.getElementById('present-link')
  console.log(presentLink.value)
  const plausibleLink = presentLink.value
  fetch(plausibleLink)
    .then((data) => data.text())
    .then(() => {
      window.location = window.location.origin + '?url=' + plausibleLink
    })
    .catch((e) => {
      console.log('Woopsie')
      console.log(e.message)
    })
}

const fileUploader = document.getElementById('file-uploader')
document.getElementById('present-link').onkeyup = function (e) {
  if (e.target.value.length > 0) {
    presentButton.style.display = 'block'
    fileUploader.style.display = 'none'
  } else {
    presentButton.style.display = 'none'
    fileUploader.style.display = 'block'
  }
}

fileUploader.addEventListener('change', function (e) {
  var fr = new FileReader()
  fr.onload = function () {
    localStorage.setItem('content', fr.result)
    window.location = window.location.origin + '?url=_file'
  }
  fr.readAsText(e.target.files[0])
})
