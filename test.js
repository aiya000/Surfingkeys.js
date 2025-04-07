api.RUNTIME('loadSettingsFromUrl', {
  url: 'http://127.0.0.1:8080/Surfingkeys.js'
}, (res) => {
  alert(`${res.status} to load settings from ${localPath}`)
})
