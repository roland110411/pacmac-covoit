import { NextRequest, NextResponse } from 'next/server'

async function myMemory(texte: string, langPaire: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=${langPaire}`
  const r = await fetch(url)
  const d = await r.json()
  return d.responseData?.translatedText || texte
}

export async function POST(req: NextRequest) {
  const { texte } = await req.json()
  if (!texte) return NextResponse.json({ fr: '', br: '' })

  const [fr, br] = await Promise.all([
    myMemory(texte, 'en|fr'),
    myMemory(texte, 'en|br'),
  ])

  return NextResponse.json({ fr, br })
}
