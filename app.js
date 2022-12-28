import express from 'express'
import { NFC } from 'nfc-pcsc'
import pretty from './pretty-logger.js'
import { GetCurrentlyPlaying, GetRecentlyPlayed, GetTopTracks, GetDevices, PausePlayer, PlayPlayer } from './spotify.js'

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

    // // example reading 4 bytes assuming containing 16bit integer
    // // !!! note that we don't need 4 bytes - 16bit integer takes just 2 bytes !!!
    // try {
    //   // reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
    //   // - blockNumber - memory block number where to start reading
    //   // - length - how many bytes to read
    //   // - blockSize - 4 for MIFARE Ultralight, 16 for MIFARE Classic
    //   // ! Caution! length must be divisible by blockSize (we have to read the whole block(s))

    //   const data = await reader.read(4, 4)

    //   pretty.info(`data read`, reader, data)

    //   const payload = data.readInt16BE(0)

    //   pretty.info(`data converted`, reader, payload)
    // } catch (err) {
    //   pretty.error(`error when reading data`, reader, err)
    // }

    // // example write 4 bytes containing 16bit integer
    // // !!! note that we don't need 16 bytes - 16bit integer takes just 2 bytes !!!
    // try {
    //   // reader.write(blockNumber, data, blockSize = 4, packetSize = 16)
    //   // - blockNumber - memory block number where to start writing
    //   // - data - what to write
    //   // - blockSize - 4 for MIFARE Ultralight, 16 for MIFARE Classic
    //   // ! Caution! data.length must be divisible by blockSize (we have to write the whole block(s))

    //   const data = Buffer.allocUnsafe(4).fill(0)
    //   const randomNumber = Math.round(Math.random() * 1000)
    //   data.writeInt16BE(randomNumber, 0)

    //   await reader.write(4, data)

    //   pretty.info(`data written`, reader, randomNumber, data)
    // } catch (err) {
    //   pretty.error(`error when writing data`, reader, err)
    // }
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
