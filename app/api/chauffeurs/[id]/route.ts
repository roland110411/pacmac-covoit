import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
async function envoyerWhatsApp(phone: string, apiKey: string, message: string) {
  try { await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`) } catch {}
}

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nom, depart, arrivee } = await req.json()
  const chauffeur = await prisma.chauffeur.update({
    where: { id: parseInt(id) },
    data: { nom: nom?.trim(), depart: depart?.trim() || null, arrivee: arrivee?.trim() || null },
  })
  return NextResponse.json(chauffeur)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const chauffeur = await prisma.chauffeur.findUnique({
    where: { id: parseInt(id) },
    include: { passagers: true },
  })

  await prisma.chauffeur.delete({ where: { id: parseInt(id) } })

  // Notifier les champions orphelins via leurs contacts enregistrés
  if (chauffeur && chauffeur.passagers.length > 0) {
    const noms = chauffeur.passagers.map(p => p.nom)
    const contacts = await prisma.contact.findMany({ where: { nom: { in: noms } } })
    await Promise.allSettled(
      contacts.map(c =>
        envoyerWhatsApp(c.phone, c.wabotKey,
          `⚠️ Covoiturage - ${chauffeur.nom} a annulé ! Tu n'as plus de voiture, rejoins un autre pilote sur l'appli.`)
      )
    )
  }

  return NextResponse.json({ ok: true })
}
