case "nurl": {
const axios = require('axios');
const FormData = require('form-data');
const quoted = quotedv2(m, from);
if (!quoted || quoted.getType() !== 'image') {
return m.reply("❌ Reply gambar dengan caption .nurl");
}
await gen.sendMessage(from, { react: { text: '🔥', key: m.key } });
try {
console.log(`[TOURL] Starting upload process`);
console.log(`[TOURL] Message type: ${quoted.getType()}`);
let buffer = await quoted.download();
if (buffer?.buffer) buffer = buffer.buffer;
if (!Buffer.isBuffer(buffer)) {
console.log(`[TOURL] Invalid buffer type:`, typeof buffer);
return m.reply("❌ Gagal mengambil gambar (buffer tidak valid)");
}
console.log(`[TOURL] Buffer size: ${buffer.length} bytes`);
const form = new FormData();
form.append('file', buffer, { filename: `image_${Date.now()}.jpg`, contentType: 'image/jpeg' });
console.log(`[TOURL] Sending request to API`);
const response = await axios.post('https://api.baguss.xyz/api/tools/tourl', form, { headers: form.getHeaders() });
console.log(`[TOURL] Response status: ${response.status}`);
console.log(`[TOURL] Response data:`, JSON.stringify(response.data));

let imageUrl = response.data?.result || response.data?.url || response.data?.data || null;
if (typeof imageUrl === 'object' && imageUrl !== null) {
imageUrl = imageUrl.url || Object.values(imageUrl)[0] || null;
}
if (!imageUrl || typeof imageUrl !== 'string') {
console.log(`[TOURL] Invalid URL structure`);
return m.reply("❌ Gagal upload gambar, URL tidak ditemukan");
}

console.log(`[TOURL] Upload success: ${imageUrl}`);
let caption = ``;
caption += `🔗 *URL:*\n${imageUrl}\n\n`;
caption += `📊 *Info:*\n`;
caption += `Size: ${(buffer.length / 1024).toFixed(2)} KB\n`;
caption += `Time: ${new Date().toLocaleString('id-ID')}`;
await m.reply(caption);
console.log(`[TOURL] Process completed`);
} catch (err) {
console.error(`[TOURL] Error:`, err.message);
console.error(`[TOURL] Full error:`, err.response?.data || err);
m.reply(`❌ Gagal upload gambar\n\nError: ${err.message}`);
}
break;
}