const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

let config;
try {
    config = require('./config.json');
} catch (error) {
    console.error("Die config.json Datei konnte nicht geladen werden.");
    process.exit(1);
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

async function playTTSInVoiceChannel(channelId, text, guild) {
    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: 'de',
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
        const voiceChannelId = '1515070770425106565';
        await playTTSInVoiceChannel(voiceChannelId, 'Neues Pokemon gespawnt ihr flachwixxer', interaction.guild);
        await interaction.reply({ content: 'Lese Nachricht im Sprachkanal vor...', ephemeral: true });
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

            await interaction.editReply(`Das ist: **${pokemonName}**\n*(Bild: ${imageUrl})*`);

        } catch (error) {
            console.error("Fehler im /helpme Befehl:", error);
            await interaction.editReply('Es gab einen Fehler bei der Ausführung des Befehls.');
        }
    }
});

client.on('messageCreate', async message => {
    // Die Benutzer-ID des offiziellen Pokétwo Bots
    const poketwoId = '716390085896962058';
    
    if (message.author.id === poketwoId) {
        if (message.embeds.length > 0 && 
            message.embeds[0].image && 
            message.embeds[0].image.url &&
            (message.embeds[0].title === 'A wild pokémon has appeared!' || message.embeds[0].title === 'A new wild pokémon has appeared!' || message.embeds[0].description?.includes('Guess the pokémon'))) {
            
            // TTS Nachricht im Sprachkanal vorlesen
            const voiceChannelId = '1515070770425106565';
            playTTSInVoiceChannel(voiceChannelId, "Neues Pokemon gespawnt ihr flachwixxer", message.guild);
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
