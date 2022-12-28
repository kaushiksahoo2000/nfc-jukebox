import express from 'express'
import { GetCurrentlyPlaying, GetRecentlyPlayed, GetTopTracks, GetDevices, PausePlayer, PlayPlayer } from './spotify.js'

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
