const { Client, GatewayIntentBits, REST, Routes, MessageFlags, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

let config;
try {
    config = require('./config.json');
} catch (error) {
    console.error("Die config.json Datei konnte nicht geladen werden.");
    process.exit(1);
}

let stats = { topPokemon: {}, topUsers: {} };
const fs = require('fs');
try {
    stats = require('./stats.json');
} catch (error) {
    fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify(stats, null, 2));
}

function saveStats() {
    fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify(stats, null, 2));
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ] 
});

// Setup Gemini API
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Setup Web Dashboard
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const history = [];

app.get('/api/history', (req, res) => {
    res.json(history);
});

app.get('/api/settings', (req, res) => {
    res.json({
        voiceChannelId: config.voiceChannelId || '',
        ttsMessage: config.ttsMessage || '',
        ttsLanguage: config.ttsLanguage || 'de'
    });
});

app.post('/api/settings', (req, res) => {
    config.voiceChannelId = req.body.voiceChannelId;
    config.ttsMessage = req.body.ttsMessage;
    config.ttsLanguage = req.body.ttsLanguage || 'de';
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 2));
    res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// Intercept console.log
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    io.emit('log', args.join(' '));
};
const originalError = console.error;
console.error = function(...args) {
    originalError.apply(console, args);
    io.emit('log', '[ERROR] ' + args.join(' '));
};

httpServer.listen(port, () => {
    originalLog(`Dashboard läuft auf http://localhost:${port}`);
});

async function playTTSInVoiceChannel(channelId, text, guild) {
    try {
        const lang = config.ttsLanguage || 'de';
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(url);

        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });
    } catch (e) {
        console.error("Voice Fehler:", e);
    }
}

// Funktion, um das Bild von einer URL als Buffer herunterzuladen
async function fetchImageAsBuffer(url) {
    // Falls node-fetch nicht gebraucht wird in neueren Node-Versionen (ab Node 18),
    // nutzen wir das eingebaute fetch
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// Funktion, die das Bild an Gemini übergibt
async function identifyPokemonWithGemini(imageUrl) {
    try {
        console.log(`Analysiere Bild mit Gemini: ${imageUrl}`);
        const imageBuffer = await fetchImageAsBuffer(imageUrl);
        
        // Verwende das Modell gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = "What Pokémon is this? Look at the creature in the image and tell me ONLY its exact English name. No other text, no punctuation, just the name.";
        
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text().trim();
        
        // Add to history
        const historyItem = { name: text, imageUrl: imageUrl, timestamp: Date.now() };
        history.push(historyItem);
        if(history.length > 50) history.shift();
        io.emit('newPokemon', historyItem);

        return text;
    } catch (error) {
        console.error("Fehler bei Gemini API:", error);
        return "Fehler bei der KI-Erkennung";
    }
}

client.once('ready', async () => {
    console.log(`Erfolgreich als ${client.user.tag} eingeloggt!`);
    
    const commands = [
        {
            name: 'helpme',
            description: 'Findet den letzten Pokétwo-Spawn und identifiziert das Pokémon via KI.',
        },
        {
            name: 'testtts',
            description: 'Testet die TTS Benachrichtigung.',
        },
        {
            name: 'sound',
            description: 'Spielt einen Soundeffekt im Sprachkanal ab.',
        },
        {
            name: 'pokedex',
            description: 'Zeigt Informationen zu einem bestimmten Pokémon (Deutsch oder Englisch).',
            options: [
                {
                    name: 'pokemon',
                    type: 3, // STRING
                    description: 'Der Name des Pokémon.',
                    required: true
                }
            ]
        },
    ];

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );
        console.log('Slash-Befehle (/) erfolgreich aktualisiert.');
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Befehle:", error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'testtts') {
        const voiceChannelId = config.voiceChannelId || '1515070770425106565';
        await playTTSInVoiceChannel(voiceChannelId, 'Neues Pokemon gespawnt ihr flachwixxer', interaction.guild);
        await interaction.reply({ content: 'Lese Nachricht im Sprachkanal vor...', flags: MessageFlags.Ephemeral });
        return;
    }

    if (interaction.commandName === 'helpme') {
        await interaction.deferReply();

        try {
            // Hole die letzten 50 Nachrichten aus dem Kanal
            const messages = await interaction.channel.messages.fetch({ limit: 50 });
            
            // Die Benutzer-ID des offiziellen Pokétwo Bots
            const poketwoId = '716390085896962058';
            
            // Suche die letzte Nachricht von Pokétwo, die ein Embed mit einem Bild hat
            const spawnMessage = messages.find(m => 
                m.author.id === poketwoId && 
                m.embeds.length > 0 && 
                m.embeds[0].image && 
                m.embeds[0].image.url &&
                (m.embeds[0].title === 'A wild pokémon has appeared!' || m.embeds[0].title === 'A new wild pokémon has appeared!' || m.embeds[0].description?.includes('Guess the pokémon'))
            );

            // Alternativer Fallback
            const fallbackSpawn = messages.find(m => 
                m.author.id === poketwoId && 
                m.embeds.length > 0 && 
                m.embeds[0].image && 
                m.embeds[0].image.url
            );
            
            const targetMessage = spawnMessage || fallbackSpawn;

            if (!targetMessage) {
                return interaction.editReply('Konnte keinen kürzlichen Pokétwo Spawn in diesem Kanal finden.');
            }

            const imageUrl = targetMessage.embeds[0].image.url;
            
            // Verhindern, dass Gemini ohne Key abstürzt
            if (!config.geminiApiKey || config.geminiApiKey === "YOUR_GEMINI_API_KEY_HERE") {
                return interaction.editReply(`Das Bild-URL ist: ${imageUrl}\n\n*Fehler: Du musst noch den geminiApiKey in die config.json eintragen, damit die Erkennung funktioniert.*`);
            }

            const pokemonName = await identifyPokemonWithGemini(imageUrl);

            // Update Stats
            const pName = pokemonName.toLowerCase();
            stats.topPokemon[pName] = (stats.topPokemon[pName] || 0) + 1;
            const uName = interaction.user.username;
            stats.topUsers[uName] = (stats.topUsers[uName] || 0) + 1;
            saveStats();

            // Fetch PokéAPI
            let pokeData = null;
            let speciesData = null;
            try {
                const axios = require('axios');
                const [response, speciesResponse] = await Promise.all([
                    axios.get(`https://pokeapi.co/api/v2/pokemon/${pName}`),
                    axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pName}`).catch(() => ({ data: null }))
                ]);
                pokeData = response.data;
                speciesData = speciesResponse.data;
            } catch (err) {
                console.error("PokeAPI Fehler:", err.message);
            }

            let title = `Das ist: **${pokemonName}**!`;
            let description = `Kopiere diesen Befehl, um es sofort zu fangen:\n\`\`\`\n@Pokétwo catch ${pokemonName}\n\`\`\``;

            if (speciesData) {
                const deNameObj = speciesData.names.find(n => n.language.name === 'de');
                if (deNameObj) {
                    title = `Das ist: **${pokemonName}** (DE: ${deNameObj.name})!`;
                }

                const flavorTextObj = speciesData.flavor_text_entries.find(f => f.language.name === 'de') || speciesData.flavor_text_entries.find(f => f.language.name === 'en');
                if (flavorTextObj) {
                    description += `\n\n*${flavorTextObj.flavor_text.replace(/\n|\f/g, ' ')}*`;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor('#5865F2')
                .setDescription(description);

            if (pokeData) {
                // Set high-quality official artwork as thumbnail
                const officialArtwork = pokeData.sprites?.other?.['official-artwork']?.front_default;
                if (officialArtwork) {
                    embed.setThumbnail(officialArtwork);
                }

                const typeEmojis = { normal: '⚪', fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', ice: '❄️', fighting: '🥊', poison: '☠️', ground: '🏜️', flying: '🦅', psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉', dark: '🌑', steel: '⚙️', fairy: '✨' };
                const types = pokeData.types.map(t => `${typeEmojis[t.type.name] || ''} ${t.type.name}`).join(', ');
                
                const normalAbilities = pokeData.abilities.filter(a => !a.is_hidden).map(a => a.ability.name).join(', ') || 'Keine';
                const hiddenAbilities = pokeData.abilities.filter(a => a.is_hidden).map(a => a.ability.name).join(', ') || 'Keine';

                embed.addFields(
                    { name: 'Typ', value: types, inline: false },
                    { name: 'Fähigkeiten (Normal)', value: normalAbilities, inline: true },
                    { name: 'Fähigkeiten (Versteckt)', value: hiddenAbilities, inline: true }
                );
            }

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (error) {
            console.error("Fehler im /helpme Befehl:", error);
            await interaction.editReply('Es gab einen Fehler bei der Ausführung des Befehls.');
        }
    }

    if (interaction.commandName === 'sound') {
        const voiceChannelId = config.voiceChannelId || '1515070770425106565';
        await playTTSInVoiceChannel(voiceChannelId, 'Hier könnte ein MP3 Sound abgespielt werden', interaction.guild);
        await interaction.reply({ content: 'Sound abgespielt!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.commandName === 'pokedex') {
        await interaction.deferReply();
        try {
            const inputName = interaction.options.getString('pokemon');
            
            // Translate using Gemini
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `Translate this Pokémon name to English: "${inputName}". If it's already English, just return it. Output ONLY the exact English name, no punctuation, no extra text.`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const englishName = response.text().trim().toLowerCase();

            // Fetch PokéAPI
            let pokeData = null;
            let speciesData = null;
            const axios = require('axios');
            const [pokeRes, speciesRes] = await Promise.all([
                axios.get(`https://pokeapi.co/api/v2/pokemon/${englishName}`).catch(() => ({ data: null })),
                axios.get(`https://pokeapi.co/api/v2/pokemon-species/${englishName}`).catch(() => ({ data: null }))
            ]);
            pokeData = pokeRes.data;
            speciesData = speciesRes.data;

            if (!pokeData) {
                return interaction.editReply(`Konnte das Pokémon **${inputName}** nicht im Pokédex finden.`);
            }

            let title = `Das ist: **${pokeData.name}**!`;
            let description = '';

            if (speciesData) {
                const deNameObj = speciesData.names.find(n => n.language.name === 'de');
                if (deNameObj) {
                    title = `Das ist: **${pokeData.name}** (DE: ${deNameObj.name})!`;
                }

                const flavorTextObj = speciesData.flavor_text_entries.find(f => f.language.name === 'de') || speciesData.flavor_text_entries.find(f => f.language.name === 'en');
                if (flavorTextObj) {
                    description += `\n\n*${flavorTextObj.flavor_text.replace(/\n|\f/g, ' ')}*`;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor('#5865F2');
            if(description) embed.setDescription(description);

            const officialArtwork = pokeData.sprites?.other?.['official-artwork']?.front_default;
            if (officialArtwork) {
                embed.setThumbnail(officialArtwork);
            }

            const typeEmojis = { normal: '⚪', fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', ice: '❄️', fighting: '🥊', poison: '☠️', ground: '🏜️', flying: '🦅', psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉', dark: '🌑', steel: '⚙️', fairy: '✨' };
            const types = pokeData.types.map(t => `${typeEmojis[t.type.name] || ''} ${t.type.name}`).join(', ');
            
            const normalAbilities = pokeData.abilities.filter(a => !a.is_hidden).map(a => a.ability.name).join(', ') || 'Keine';
            const hiddenAbilities = pokeData.abilities.filter(a => a.is_hidden).map(a => a.ability.name).join(', ') || 'Keine';

            embed.addFields(
                { name: 'Typ', value: types, inline: false },
                { name: 'Fähigkeiten (Normal)', value: normalAbilities, inline: true },
                { name: 'Fähigkeiten (Versteckt)', value: hiddenAbilities, inline: true }
            );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Fehler im /pokedex Befehl:", error);
            await interaction.editReply('Fehler beim Abrufen des Pokédex.');
        }
    }
});

client.on('messageCreate', async message => {
    // Die Benutzer-ID des offiziellen Pokétwo Bots
    const poketwoId = '716390085896962058';
    
    if (message.author.id === poketwoId) {
        if (message.embeds.length > 0 && 
            message.embeds[0].image && 
            message.embeds[0].image.url) {
            
            const title = message.embeds[0].title || '';
            const desc = message.embeds[0].description || '';
            
            const isSpawn = title.includes('A wild pokémon has appeared') || title.includes('A new wild pokémon has appeared') || desc.includes('Guess the pokémon');
            const isLegendary = title.toLowerCase().includes('legendary') || desc.toLowerCase().includes('legendary');

            if (isLegendary) {
                await message.channel.send('@everyone 🚨 EIN LEGENDÄRES POKÉMON IST GESPAWNT! 🚨');
                const voiceChannelId = config.voiceChannelId || '1515070770425106565';
                playTTSInVoiceChannel(voiceChannelId, "Achtung! Ein legendäres Pokemon ist gespawnt!", message.guild);
            } else if (isSpawn) {
                const voiceChannelId = config.voiceChannelId || '1515070770425106565';
                const msg = config.ttsMessage || "Neues Pokemon gespawnt";
                playTTSInVoiceChannel(voiceChannelId, msg, message.guild);
            }
        }
    }
});

if (!config.token || config.token === "YOUR_BOT_TOKEN_HERE") {
    console.error("Bitte füge deinen Bot-Token in die config.json ein.");
    process.exit(1);
}

client.login(config.token).catch(err => {
    console.error("Fehler beim Login. Überprüfe deinen Bot-Token in der config.json.", err);
});
