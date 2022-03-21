const express = require('express')
const router = express.Router()
const axios = require('axios')

function changeColor(red, green, blue) {
  axios({
    url: 'http://10.9.21.211:80/api/led/change',
    crossDomain: true,
    method: 'post',
    data: {
      red: red,
      green: green,
      blue: blue
    }
  })
}

router.get('/', (req, res, next) => {

  const discoCounts = 100
  let discoCount = 0

  let red = 50
  let green = 150
  let blue = 255

  let myInterval = setInterval(discoParty, 100)

  function discoParty() {
    if (discoCount++ >= discoCounts)
      clearInterval(myInterval)

    if (red >= 255) {
      red -= 255
    }
    if (green >= 255) {
      green -= 255
    }
    if (blue >= 255) {
      blue -= 255
    }

    changeColor(red, green, blue)

    red += 50
    green += 50
    blue += 50
  }

  res.send('LED Function goes here')
})

module.exports = router
