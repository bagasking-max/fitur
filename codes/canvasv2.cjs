const { createCanvas, loadImage } = require("canvas")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

function extractImageNode(m) {
  const msg = m.message || m.msg || {}

  const quoted =
    m.quoted?.message ||
    m.quoted?.msg ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    null

  return (
    msg.imageMessage ||
    quoted?.imageMessage ||
    null
  )
}

async function downloadImage(node) {
  try {
    const stream = await downloadContentFromMessage(node, "image")
    let buffer = Buffer.alloc(0)

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer.length ? buffer : null
  } catch (e) {
    console.error("Download image error:", e)
    return null
  }
}

async function applyPinkHijau(buffer) {
  const img = await loadImage(buffer)
  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data

  const pink = [246, 154, 193]
  const green = [28, 82, 48]

  for (let i = 0; i < data.length; i += 4) {
    const brightness =
      (data[i] + data[i + 1] + data[i + 2]) / 3 / 255

    data[i]     = pink[0] * brightness + green[0] * (1 - brightness)
    data[i + 1] = pink[1] * brightness + green[1] * (1 - brightness)
    data[i + 2] = pink[2] * brightness + green[2] * (1 - brightness)
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas.toBuffer("image/png")
}

let handler = async (m, { client }) => {
  try {
    const imageNode = extractImageNode(m)

    if (!imageNode) {
      return m.reply(
        "⚠️ *Tidak ditemukan gambar.*\nKirim atau reply gambar dengan perintah *.pinkhijau*"
      )
    }

    const mime = imageNode.mimetype || ""
    if (!mime.startsWith("image/")) {
      return m.reply("⚠️ Media yang direply bukan gambar.")
    }

    const statusMsg = await m.reply("⏳ Proses...\nStatus: downloading")

    const buffer = await downloadImage(imageNode)
    if (!buffer) throw new Error("Gagal mengunduh gambar.")

    await client.sendMessage(m.chat, {
      edit: statusMsg.key,
      text: "⏳ Proses...\nStatus: editing",
    })

    const finalBuffer = await applyPinkHijau(buffer)

    await client.sendMessage(m.chat, {
      edit: statusMsg.key,
      text: "✅ Success!\nStatus: sending",
    })

    await client.sendMessage(
      m.chat,
      {
        image: finalBuffer,
        caption: "🎨 Filter *PinkHijau* berhasil diterapkan!",
      },
      { quoted: m }
    )
  } catch (e) {
    console.error("PinkHijau Error:", e)
    m.reply("❌ Terjadi kesalahan:\n" + e.message)
  }
}

handler.command = ["pinkhijau", "ph"]
handler.tags = ["editor", "fun", "color"]
handler.help = ["pinkhijau (reply gambar)"]
handler.limit = true

module.exports = handler