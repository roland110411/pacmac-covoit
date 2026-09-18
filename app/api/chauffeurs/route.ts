import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const chauffeurs = await prisma.chauffeur.findMany({
    where: { efface: false },
    include: { passagers: { where: { efface: false }, orderBy: { createdAt: 'asc' } } },
    orderBy: [{ special: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(chauffeurs)
}

export async function POST(req: NextRequest) {
  const { nom, depart, arrivee, capacite, special, phone, wabotKey, heureRdv } = await req.json()
  if (!nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  const chauffeur = await prisma.chauffeur.create({
    data: {
      nom: nom.trim(),
      depart: depart?.trim() || null,
      arrivee: arrivee?.trim() || null,
      capacite: capacite ? parseInt(capacite) : 4,
      special: special ?? false,
      heureRdv: heureRdv?.trim() || '17:40',
      phone: phone?.trim() || null,
      wabotKey: wabotKey?.trim() || null,
    },
    include: { passagers: true },
  })
  return NextResponse.json(chauffeur, { status: 201 })
}
