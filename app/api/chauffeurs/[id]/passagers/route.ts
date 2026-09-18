import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
async function envoyerWhatsApp(phone: string, apiKey: string, message: string) {
  try { await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`) } catch {}
}

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chauffeurId = parseInt(id)
  const { nom } = await req.json()
  if (!nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const chauffeur = await prisma.chauffeur.findUnique({
    where: { id: chauffeurId },
    include: { _count: { select: { passagers: true } } },
  })
  if (!chauffeur) return NextResponse.json({ error: 'Chauffeur introuvable' }, { status: 404 })
  if (chauffeur._count.passagers >= chauffeur.capacite) {
    return NextResponse.json({ error: `Complet (${chauffeur.capacite} passagers max)` }, { status: 400 })
  }

  const passager = await prisma.passager.create({ data: { nom: nom.trim(), chauffeurId } })

  // Notifier le pilote via WhatsApp
  if (!chauffeur.special && chauffeur.phone && chauffeur.wabotKey) {
    const total = chauffeur._count.passagers + 1
    envoyerWhatsApp(
      chauffeur.phone,
      chauffeur.wabotKey,
      `🏁 Covoiturage - ${nom} a rejoint ta voiture ! (${total}/${chauffeur.capacite} champions)`
    )
  }

  return NextResponse.json(passager, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await params
  const { passagerId } = await req.json()
  await prisma.passager.delete({ where: { id: passagerId } })
  return NextResponse.json({ ok: true })
}
