export async function envoyerWhatsApp(phone: string, apiKey: string, message: string) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
  try {
    await fetch(url)
  } catch {}
}
