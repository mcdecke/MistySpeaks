const express = require('express')
const router = express.Router()
const axios = require('axios')
const fs = require('fs')
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1')
const execSync = require('child_process').execSync

const tempMp3Filename = 'temp.mp3'

function obtainMp3(fname, speechString) {
  console.log('speechString', speechString)

  return new Promise((resolve, reject) => {
    const textToSpeech = new TextToSpeechV1({username: process.env.USERNAME, password: process.env.PASSWORD})

    const synthesizeParams = {
      text: speechString,
      accept: 'audio/mp3',
      voice: 'en-US_AllisonVoice'
    }

    const writable = fs.createWriteStream(fname)
    textToSpeech.synthesize(synthesizeParams).on('error', function(error) {}).pipe(writable)

    writable.on('error', (err) => {
      (err)
    }).on('finish', function() {
      resolve("success")
    })
  })
}

// BYTE ARRAY
function read(fname) {
  // file is a ArrayBuffer
  const file = fs.readFileSync(fname)
  const b = Buffer.from(file)
  // ab refers to the undlying ArrayBuffer created with b.
  const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  // Turns the buffer in unsigned integer 8 array string
  const ui8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT).toString()

  // Resolves the promise and returns the ui8 string
  return ui8
}

async function readAndWrite(textToSay, volume) {
  // Have Watson API convert text to mp3 file
  const writeFile = await obtainMp3(tempMp3Filename, textToSay)

  // Invoke FFMPEG to boost volume
  execSync(`ffmpeg -i ${tempMp3Filename} -af 'volume=${volume}' ${tempMp3Filename} -y`)

  // convert mp3 file to string of bytes
  let byteArrayString = read(tempMp3Filename)

  return byteArrayString
}

// MISTY CALLS

async function talk(textToSay, volume) {
  const byteString = await readAndWrite(textToSay, volume)
  axios({
    url: 'http://10.9.21.211:80/api/audio',
    method: 'post',
    crossDomain: true,
    data: {
      "FilenameWithoutPath": tempMp3Filename,
      "DataAsByteArrayString": byteString,
      "ImmediatelyApply": false,
      "OverwriteExisting": true
    }
  }).then(() => {
    axios({
      url: 'http://10.9.21.211:80/api/audio/play',
      crossDomain: true,
      method: 'post',
      data: {
        AssetId: tempMp3Filename
      }
    })
  })
}

// Diagnostic
router.get('/', (req, res, next) => {
  talk('do the thing')
  res.send('TTS diagnostic')
})


router.post('/', (req, res, next) => {
  console.log('post body', req.body)
  talk(req.body.message, req.body.volume)
  res.send('TTS POST ROUTE SUCCESS')
})

module.exports = router
