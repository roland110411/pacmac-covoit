import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { nom, phone, wabotKey } = await req.json()
  if (!nom?.trim() || !phone?.trim() || !wabotKey?.trim())
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })

  const contact = await prisma.contact.upsert({
    where: { nom: nom.trim() },
    update: { phone: phone.trim(), wabotKey: wabotKey.trim() },
    create: { nom: nom.trim(), phone: phone.trim(), wabotKey: wabotKey.trim() },
  })
  return NextResponse.json(contact, { status: 201 })
}
