import 'dotenv/config'
import fetch from 'node-fetch'
import querystring from 'querystring'

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`
const CURRENTLY_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played`
const DEVICES_ENDPOINT = `https://api.spotify.com/v1/me/player/devices`
const PLAY_ENDPOINT = 'https://api.spotify.com/v1/me/player/play'
const PAUSE_ENDPOINT = 'https://api.spotify.com/v1/me/player/pause'
const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')

/*
Hack for no system to manage authorization 
timeout and refresh tokens... we'll get an
access token from the spotify api on every
request hehe
*/
const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      'Content-Type': 'application/json',
      refresh_token,
    }),
  })
  return response.json()
}

export const GetCurrentlyPlaying = async () => {
  const { access_token } = await getAccessToken()
  console.log({ access_token })
  return fetch(CURRENTLY_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const GetTopTracks = async () => {
  const { access_token } = await getAccessToken()
  console.log({ access_token })
  return fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const GetRecentlyPlayed = async () => {
  const response = await getAccessToken()
  const { access_token } = response
  return fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const GetDevices = async () => {
  const response = await getAccessToken()
  const { access_token } = response
  return fetch(DEVICES_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const PlayPlayer = async (trackID) => {
  const response = await getAccessToken()
  const { access_token } = response
  console.log({ access_token, trackID })
  return fetch(PLAY_ENDPOINT, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: ['spotify:track:1qyKIq8hw9yWkuPJ9ZjuvK'] }),
  })
}

export const PausePlayer = async () => {
  const response = await getAccessToken()
  const { access_token } = response
  console.log({ access_token })
  return fetch(PAUSE_ENDPOINT, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const GetSpotifyDevices = async () => {}
