import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const debut = new Date()
  debut.setHours(0, 0, 0, 0)
  const fin = new Date()
  fin.setHours(23, 59, 59, 999)

  const chauffeurs = await prisma.chauffeur.findMany({
    where: {
      OR: [
        { special: true },
        { createdAt: { gte: debut, lte: fin } },
      ],
    },
    include: { passagers: { where: { createdAt: { gte: debut, lte: fin } }, orderBy: { createdAt: 'asc' } } },
    orderBy: [{ special: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(chauffeurs)
}

export async function POST(req: NextRequest) {
  const { nom, depart, arrivee, capacite, special, phone, wabotKey } = await req.json()
  if (!nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  const chauffeur = await prisma.chauffeur.create({
    data: {
      nom: nom.trim(),
      depart: depart?.trim() || null,
      arrivee: arrivee?.trim() || null,
      capacite: capacite ? parseInt(capacite) : 4,
      special: special ?? false,
      phone: phone?.trim() || null,
      wabotKey: wabotKey?.trim() || null,
    },
    include: { passagers: true },
  })
  return NextResponse.json(chauffeur, { status: 201 })
}
