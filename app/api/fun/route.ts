import { NextRequest, NextResponse } from 'next/server'

async function myMemory(texte: string, langPaire: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=${langPaire}`
    const r = await fetch(url)
    const d = await r.json()
    return d.responseData?.translatedText || texte
  } catch {
    return texte
  }
}

async function traduire(texte: string) {
  const [fr, br] = await Promise.all([
    myMemory(texte, 'en|fr'),
    myMemory(texte, 'en|br'),
  ])
  return { fr, br }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    switch (id) {
      case 'bored': {
        const r = await fetch('https://bored-api.appbrewery.com/random')
        const d = await r.json()
        const { fr, br } = await traduire(d.activity || 'No activity found')
        return NextResponse.json({ text: `🇫🇷 ${fr}\n\n🏴 ${br}` })
      }

      case 'chuck': {
        const r = await fetch('https://api.chucknorris.io/jokes/random')
        const d = await r.json()
        const { fr, br } = await traduire(d.value)
        return NextResponse.json({ text: `🇫🇷 ${fr}\n\n🏴 ${br}` })
      }

      case 'joke': {
        const r = await fetch('https://official-joke-api.appspot.com/random_joke')
        const d = await r.json()
        const [setup, punchline] = await Promise.all([
          traduire(d.setup),
          traduire(d.punchline),
        ])
        return NextResponse.json({
          text: `🇫🇷 ${setup.fr}\n👉 ${punchline.fr}\n\n🏴 ${setup.br}\n👉 ${punchline.br}`
        })
      }

      case 'kanye': {
        const r = await fetch('https://api.kanye.rest')
        const d = await r.json()
        const { fr, br } = await traduire(d.quote)
        return NextResponse.json({ text: `🇫🇷 "${fr}"\n\n🏴 "${br}"` })
      }

      case 'yesno': {
        const r = await fetch('https://yesno.wtf/api')
        const d = await r.json()
        const repFr = d.answer === 'yes' ? '✅ OUI' : d.answer === 'no' ? '❌ NON' : '🤔 PEUT-ÊTRE'
        const repBr = d.answer === 'yes' ? "✅ YA" : d.answer === 'no' ? "❌ NAC'H" : '🤔 MARTEZE'
        return NextResponse.json({ text: `🇫🇷 ${repFr}  |  🏴 ${repBr}`, image: d.image })
      }

      case 'advice': {
        const r = await fetch('https://api.adviceslip.com/advice', { cache: 'no-store' })
        const d = await r.json()
        const { fr, br } = await traduire(d.slip?.advice)
        return NextResponse.json({ text: `🇫🇷 ${fr}\n\n🏴 ${br}` })
      }

      case 'cat':
        return NextResponse.json({ image: `https://cataas.com/cat?t=${Date.now()}` })

      case 'dog': {
        const r = await fetch('https://dog.ceo/api/breeds/image/random')
        const d = await r.json()
        return NextResponse.json({ image: d.message })
      }

      default:
        return NextResponse.json({ text: 'API inconnue' })
    }
  } catch {
    return NextResponse.json({ text: '⚠️ Erreur de connexion' })
  }
}
