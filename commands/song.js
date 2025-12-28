const axios = require('axios');
const yts = require('yt-search');

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        // Usage message
        if (!text || text.trim() === ".song") {
            const usageMsg =
                `╭───『 🎧 *ꜱᴏɴɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* 』──\n` +
                `│ 🎵 *Usage:* .song <query or YouTube link>\n` +
                `│ 📌 Example:\n` +
                `│ .song Alan Walker faded\n` +
                `│ .song https://youtu.be/ox4tmEV6-QU\n` +
                `╰───────────────╯\n\n` +
                `> Powered by Lucky Tech Hub`;

            await sock.sendMessage(chatId, { text: usageMsg }, { quoted: message });
            return;
        }

        // --- YouTube Search or Link ---
        let video, videoUrl;
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            const videoId = text.includes('v=')
                ? text.split('v=')[1].split('&')[0]
                : text.split('/').pop();
            const search = await yts({ videoId });
            if (!search || !search.videos.length) {
                await sock.sendMessage(chatId, { text: '❌ No video found for that link.' }, { quoted: message });
                return;
            }
            video = search.videos[0];
        } else {
            const search = await yts(text);
            if (!search.videos.length) {
                await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        videoUrl = video.url;

        // --- Download Logic with Multi-API Fallback ---
        let songData = null;

        // 1️⃣ Try Izumi API
        try {
            const izumiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`;
            const res = await axios.get(izumiUrl, { timeout: 25000 });
            if (res.data?.result?.download) {
                songData = {
                    title: res.data.result.title,
                    download: res.data.result.download
                };
            } else {
                throw new Error("Izumi returned invalid data");
            }
        } catch (err) {
            console.log("Izumi API failed:", err.message);
        }

        // 2️⃣ Try Violetics API if Izumi failed
        if (!songData) {
            try {
                const violeticsUrl = `https://api.violetics.pw/api/downloader/ytmp3?apikey=beta&url=${encodeURIComponent(videoUrl)}`;
                const res = await axios.get(violeticsUrl, { timeout: 25000 });
                if (res.data?.result?.download_url) {
                    songData = {
                        title: res.data.result.title,
                        download: res.data.result.download_url
                    };
                } else {
                    throw new Error("Violetics returned invalid data");
                }
            } catch (err) {
                console.log("Violetics API failed:", err.message);
            }
        }

        // 3️⃣ Try SnapSave API if both failed
        if (!songData) {
            try {
                const snapUrl = `https://snapinsta.app/api/v1/youtube?url=${encodeURIComponent(videoUrl)}`;
                const res = await axios.get(snapUrl, { timeout: 25000 });
                if (res.data?.downloadUrl) {
                    songData = {
                        title: video.title,
                        download: res.data.downloadUrl
                    };
                } else {
                    throw new Error("SnapSave returned invalid data");
                }
            } catch (err) {
                console.log("SnapSave API failed:", err.message);
            }
        }

        // ❌ If all APIs failed
        if (!songData) {
            await sock.sendMessage(chatId, { text: "❌ Failed to download song. Please try again later." }, { quoted: message });
            return;
        }

        // --- Send song info ---
        const songInfo =
            `╭───『 🎧 *ꜱᴏɴɢ ɪɴꜰᴏ* 』──\n` +
            `│ 📀 *Title:* ${songData.title || video.title}\n` +
            `│ ⏱️ *Duration:* ${video.timestamp || "Unknown"}\n` +
            `│ 👁️ *Views:* ${video.views?.toLocaleString() || "Unknown"}\n` +
            `│ 🌍 *Published:* ${video.ago || "Unknown"}\n` +
            `│ 👤 *Author:* ${video.author?.name || "Unknown"}\n` +
            `│ 🔗 *URL:* ${videoUrl}\n` +
            `╰───────────────╯\n\n` +
            `╭───⌯ Choose Type ⌯───\n` +
            `│ 1️⃣ 🎵 Audio (Play)\n` +
            `│ 2️⃣ 📁 Document (Save)\n` +
            `╰───────────────╯\n` +
            `> Powered by Lucky Tech Hub`;

        const sentMsg = await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: songInfo
        }, { quoted: message });

        // --- Listen for Reply (1 or 2) ---
        const listener = async ({ messages }) => {
            try {
                const reply = messages[0];
                const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text;
                if (!body) return;
                const isReplyToSong = reply.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;
                if (!["1", "2"].includes(body.trim()) || !isReplyToSong) return;

                clearTimeout(timeout);
                sock.ev.off("messages.upsert", listener);
                await sock.sendMessage(chatId, { text: "⏳ Downloading audio..." }, { quoted: reply });

                const fileName = `${songData.title || "song"}.mp3`;

                if (body.trim() === "1") {
                    await sock.sendMessage(chatId, {
                        audio: { url: songData.download },
                        mimetype: "audio/mpeg",
                        fileName
                    }, { quoted: reply });
                } else {
                    await sock.sendMessage(chatId, {
                        document: { url: songData.download },
                        mimetype: "audio/mpeg",
                        fileName
                    }, { quoted: reply });
                }

            } catch (err) {
                console.error("Song reply error:", err.message);
                await sock.sendMessage(chatId, { text: "❌ Download failed. Try again later." });
            }
        };

        sock.ev.on("messages.upsert", listener);

        const timeout = setTimeout(() => {
            sock.ev.off("messages.upsert", listener);
            sock.sendMessage(chatId, { text: "⌛ Session timed out. Please use the command again." });
        }, 60000);

    } catch (err) {
        console.error("Song command error:", err.message);
        await sock.sendMessage(chatId, { text: "❌ Failed to download song." }, { quoted: message });
    }
}

module.exports = songCommand;
