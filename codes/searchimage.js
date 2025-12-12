case "searchimg":
case "gimage":
case "googleimage": {
if (!text) return m.reply("❌ Masukkan query!\n\nContoh: .searchimg anime keren");
m.reply("🔍 Mencari gambar...");
try {
const query = encodeURIComponent(text);
const apiUrl = `https://api-faa.my.id/faa/google-image?query=${query}`;
console.log(`[SEARCHIMG] Query: ${text}`);
console.log(`[SEARCHIMG] API URL: ${apiUrl}`);
const response = await axios.get(apiUrl);
console.log(`[SEARCHIMG] Response status: ${response.status}`);
console.log(`[SEARCHIMG] Response data:`, JSON.stringify(response.data).substring(0, 200));
if (!response.data || !response.data.result || response.data.result.length === 0) {
console.log(`[SEARCHIMG] No results found`);
return m.reply("❌ Tidak ditemukan hasil untuk query tersebut");
}
const results = response.data.result;
const totalResults = results.length;
const maxResults = Math.min(14, totalResults);
console.log(`[SEARCHIMG] Total results: ${totalResults}, Using: ${maxResults}`);
let caption = `🖼️ *Google Image Search*\n\n`;
caption += `📝 Query: ${text}\n`;
caption += `📊 Total: ${totalResults} gambar\n\n`;
caption += `🔗 *URL Results:*\n\n`;
for (let i = 0; i < maxResults; i++) {
caption += `${i + 1}. ${results[i]}\n\n`;
}
console.log(`[SEARCHIMG] Sending first image with caption`);
await gen.sendMessage(from, {
image: { url: results[0] },
caption: caption
}, { quoted: m });
console.log(`[SEARCHIMG] Process completed successfully`);
} catch (err) {
console.error(`[SEARCHIMG] Error:`, err.message);
console.error(`[SEARCHIMG] Full error:`, err);
m.reply(`❌ Gagal mencari gambar\n\nError: ${err.message}`);
}
break;
}