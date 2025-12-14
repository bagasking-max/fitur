/**
 * ┌─「 Tixo Bot 」
 * │
 * ├ Creator: Tio × Tixo MD
 * ├ Platform: WhatsApp Bot
 * ├ Support us with a donation!
 * └─ wa.me/6282285357346 ✨
 */

import { Sticker } from 'wa-sticker-formatter';
import fs from 'fs';
import path from 'path';

const namedColors = {
  hitam: "000000", putih: "ffffff", merah: "ff0000", biru: "0000ff", hijau: "00ff00",
  kuning: "ffff00", pink: "ffc0cb", ungu: "800080", oranye: "ffa500", abu: "808080",
  birutua: "00008b", birumuda: "87ceeb", emas: "ffd700", perak: "c0c0c0", coklat: "8b4513",
  cyan: "00ffff", toska: "40e0d0", magenta: "ff00ff", olive: "808000", navy: "000080",
  lavender: "e6e6fa", krem: "fdf5e6", transparan: "00000000",
  "🔴": "ff0000", "🔵": "0000ff", "🟢": "00ff00", "🟡": "ffff00", "🟠": "ffa500", "🟣": "800080",
  "⚫": "000000", "⚪": "ffffff", "🟥": "ff4c4c", "🟧": "ff9900", "🟨": "ffff66", "🟩": "66ff66",
  "🟦": "6699ff", "🟪": "cc66ff", "⬛": "1a1a1a", "⬜": "e6e6e6"
};

let Tio = async (m, { conn, text }) => {
  if (!conn.brat) conn.brat = {};
  if (!text) {
    return m.reply(`📌 *Format:*\n.brat [teks] --[warna_bg] --[warna_teks]\n\n🖌️ *Contoh:*\n• .brat Halo --hitam --putih\n• .brat Keren --🔴 --⚪\n• .brat Mantap --#000 --#fff\n\n🎨 *Warna Didukung:*\n• Nama: merah, biru, ungu, dll\n• Emoji: 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪\n• Hex: #123456\n\n🌀 *Mode Emoji:*\n❤️ = Sticker\n👍 = Sticker GIF\n🙏 = Video\n\nReact pesan setelah kirim .brat`);
  }
  const sent = await conn.sendMessage(m.chat, {
    text: `React pesan ini:\n\n👍 = Sticker GIF\n❤️ = Sticker Biasa\n🙏 = Video`
  }, { quoted: m });
  conn.brat[m.sender] = { text, id: sent.key.id };
};

Tio.help = ['brat'];
Tio.tags = ['sticker', 'tools'];
Tio.command = /^(brat)$/i;
Tio.limit = true;

Tio.before = async (m, { conn }) => {
  if (!conn.brat) conn.brat = {};
  if (m.type === "reactionMessage") return;
  if (!(m.sender in conn.brat)) return;

  const { text, id } = conn.brat[m.sender];
  let bg = "ffffff", color = "000000";

  const args = text.trim().split(/\s+/);
  const flags = args.filter(x => x.startsWith('--'));
  const realText = args.filter(x => !x.startsWith('--')).join(" ") || " ";

  if (flags[0]) {
    const val = flags[0].replace(/^--/, '').toLowerCase();
    bg = namedColors[val] || val.replace("#", "");
  }
  if (flags[1]) {
    const val = flags[1].replace(/^--/, '').toLowerCase();
    color = namedColors[val] || val.replace("#", "");
  }

  const BASE_IMAGE = "https://ytdlpyton.nvlgroup.my.id/maker/brat";
  const BASE_VIDEO = "https://ytdlpyton.nvlgroup.my.id/maker/bratvid";
  const makeURL = (base, txt) => `${base}?text=${encodeURIComponent(txt)}&background=%23${bg}&color=%23${color}`;

  const tmp = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

  const fetchVideoBuffer = async (url) => {
    const json = await Func.fetchJson(url);
    return await Func.fetchBuffer(json.video_url);
  };

  const reactText = m.message?.reactionMessage?.text;
  const reactId = m.message?.reactionMessage?.key?.id;

  try {
    // 👍 atau 🙏 → video/gif
    if ((reactText === "👍" || reactText === "🙏") && reactId === id) {
      await m.reply(global.msg.wait);

      const output = path.join(tmp, `bratvid_${Date.now()}.mp4`);
      const videoBuffer = await fetchVideoBuffer(makeURL(BASE_VIDEO, realText));
      fs.writeFileSync(output, videoBuffer);

      if (reactText === "👍") {
        const stiker = await createSticker(false, output, global.info.packname, global.info.author, 20);
        await conn.sendFile(m.chat, stiker, '', '', m);
      } else {
        await conn.sendFile(m.chat, output, '', 'Brat video', m);
      }

      fs.existsSync(output) && fs.unlinkSync(output);
    }

    // ❤️ → sticker biasa (pakai image_url dari API)
    if (reactText === "❤️" && reactId === id) {
      await m.reply(global.msg.wait);

      const json = await Func.fetchJson(makeURL(BASE_IMAGE, realText));
      const fileUrl = json.image_url; // ✅ gunakan image_url

      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error("API tidak mengembalikan image_url yang valid");
      }

      const stiker = await createSticker(false, fileUrl, global.info.packname, global.info.author, 50);
      await conn.sendFile(m.chat, stiker, '', '', m);
    }
  } catch (err) {
    m.reply(`Gagal: ${err.message}`);
  } finally {
    delete conn.brat[m.sender];
  }
};

export default Tio;

async function createSticker(img, url, packName, authorName, quality) {
  return (new Sticker(img || url, {
    type: 'full',
    pack: packName,
    author: authorName,
    quality
  })).toBuffer();
}