import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const q = searchParams.get('q') // for fallback

  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=imperial`

  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`
  } else if (q) {
    url += `&q=${q}`
  } else {
    return NextResponse.json({ error: 'Location parameters required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch weather data')
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}