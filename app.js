import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'
import { NFC } from 'nfc-pcsc'
import pretty from './pretty-logger.js'
import { GetCurrentlyPlaying, GetRecentlyPlayed, GetTopTracks, GetDevices, PausePlayer, PlayPlayer } from './spotify.js'
import SONGS from './music.js'

const nfc = new NFC()
const app = express()
const port = 4000

app.get('/currentlyplaying', async (req, res) => {
  try {
    const resp = await GetCurrentlyPlaying()
    const current = await resp.json()
    console.log(current)
    res.json(current)
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get recently played failed` })
  }
})

app.get('/currentWithBitmap', async (req, res) => {
  try {
    const resp = await GetCurrentlyPlaying()
    const current = await resp.json()
    const {
      item: {
        name,
        album: { artists, images },
      },
    } = current
    const artistNames = artists.map((x) => x['name']).join(' - ')
    const albumArtURL = images[1]['url']
    console.log({ name, artistNames, albumArtURL })

    fetch(albumArtURL)
      .then((res) => res.body.pipe(fs.createWriteStream('./albumArt.jpg')))
      .catch((err) => console.log(err))

    res.json({
      name,
      artistNames,
      albumArtURL,
    })
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get recently played failed` })
  }
})

app.get('/currentWithBuffer', async (req, res) => {
  try {
    const resp = await GetCurrentlyPlaying()
    const current = await resp.json()
    const {
      item: {
        name,
        album: { artists, images },
      },
    } = current
    const artistNames = artists.map((x) => x['name']).join(' - ')
    const albumArt = images[1]['url']
    console.log(albumArt)
    const albumArtData = await fetch(albumArt)
    const albumArtBuffer = await albumArtData.arrayBuffer()
    const aaBuffer = Buffer.from(albumArtBuffer)
    const aaBufferHexString = Buffer.from(albumArtBuffer).toString('hex')

    console.log(aaBufferHexString)

    let bytez = []
    for (var i = 0; i < aaBufferHexString.length; i += 2) {
      let stringbyte = '0x' + aaBufferHexString[i] + '' + aaBufferHexString[i + 1]
      bytez.push(stringbyte)
    }
    console.log(bytez)

    res.json({
      name,
      artistNames,
      albumArt,
      // aaBuffer,
      // aaBufferHexString,
      bytez,
    })
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get recently played failed` })
  }
})

app.get('/recentlyplayed', async (req, res) => {
  try {
    const resp = await GetRecentlyPlayed()
    const { items } = await resp.json()
    console.log({ items })
    res.json(items)
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get recently played failed` })
  }
})

app.get('/toptracks', async (req, res) => {
  try {
    const resp = await GetTopTracks()
    const { items } = await resp.json()
    console.log({ items })
    res.json(items)
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get top tracks failed` })
  }
})

app.get('/devices', async (req, res) => {
  try {
    const resp = await GetDevices()
    const { devices } = await resp.json()
    console.log({ devices })
    res.json(devices)
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `get devices failed` })
  }
})

app.get('/play/:trackID', async (req, res) => {
  const {
    params: { trackID },
  } = req
  console.log({ trackID })
  try {
    const resp = await PlayPlayer(trackID)
    res.json('hello from play')
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `put play failed` })
  }
})

app.get('/pause', async (req, res) => {
  try {
    const resp = await PausePlayer()
    res.json('hello from pause')
  } catch (err) {
    console.log(`ERROR: `, err)
    res.json({ error: `put pause failed` })
  }
})

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

nfc.on('reader', async (reader) => {
  pretty.info(`device attached`, reader)

  // enable when you want to auto-process ISO 14443-4 tags (standard=TAG_ISO_14443_4)
  // when an ISO 14443-4 is detected, SELECT FILE command with the AID is issued
  // the response is available as card.data in the card event
  // you can set reader.aid to:
  // 1. a HEX string (which will be parsed automatically to Buffer)
  reader.aid = 'F222222222'
  // 2. an instance of Buffer containing the AID bytes
  // reader.aid = Buffer.from('F222222222', 'hex');
  // 3. a function which must return an instance of a Buffer when invoked with card object (containing standard and atr)
  //    the function may generate AIDs dynamically based on the detected card
  // reader.aid = ({ standard, atr }) => {
  //
  // 	return Buffer.from('F222222222', 'hex');
  //
  // };

  reader.on('card', async (card) => {
    pretty.info(`card detected`, reader, card)
    const { uid } = card
    const trackID = SONGS[uid]
    console.log({ uid, trackID })
    if (uid) {
      try {
        const resp = await PlayPlayer(trackID)
      } catch (err) {
        console.log(`ERROR: `, err)
      }
    }
  })

  reader.on('error', (err) => {
    pretty.error(`an error occurred`, reader, err)
  })

  reader.on('end', () => {
    pretty.info(`device removed`, reader)
  })
})

nfc.on('error', (err) => {
  pretty.error(`an error occurred`, err)
})
