# Pokétwo Helper Bot

[English](README.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [Français](README.fr.md)

Ein Discord Bot, der dir hilft, wild spawnende Pokémon vom "Pokétwo" Bot zu identifizieren. Der Bot nutzt die offizielle Google Gemini AI, um Bilder aus Discord zu analysieren und den englischen Namen des Pokémon auszugeben. Außerdem sendet der Bot eine TTS (Text-to-Speech) Benachrichtigung in einen bestimmten Sprachkanal, wenn ein neues Pokémon erscheint.

## Features

- `/helpme`: Findet den letzten Pokétwo-Spawn im aktuellen Kanal und nutzt Gemini AI (Bilderkennung), um das gesuchte Pokémon zu benennen.
- `/testtts`: Sendet eine Test-Benachrichtigung an den konfigurierten Voice-Channel.
- **Automatische Erkennung**: Sobald Pokétwo ein neues wildes Pokémon postet, geht der Bot in einen bestimmten Sprachkanal, liest eine Benachrichtigung laut vor und geht wieder.

## Voraussetzungen

- [Node.js](https://nodejs.org/en/) (Version 16.14.0 oder neuer)
- Ein eigener Discord Bot Token & Client ID ([Discord Developer Portal](https://discord.com/developers/applications))
- Ein Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

## Installation

1. **Repository klonen**  
   Klone dieses Repository auf deinen Rechner (oder lade die ZIP-Datei herunter).

2. **Abhängigkeiten installieren**  
   Öffne ein Terminal in dem Verzeichnis des Bots und führe folgenden Befehl aus:
   ```bash
   npm install
   ```

3. **Konfiguration erstellen**  
   Kopiere die Datei `config.example.json` und benenne sie in `config.json` um.
   Trage dann deine Tokens und Einstellungen in die `config.json` ein:
   ```json
   {
     "token": "DEIN_DISCORD_BOT_TOKEN",
     "clientId": "DEINE_DISCORD_CLIENT_ID",
     "geminiApiKey": "DEIN_GEMINI_API_KEY",
     "voiceChannelId": "ID_DEINES_VOICE_CHANNELS",
     "ttsMessage": "Text, den der Bot vorlesen soll"
   }
   ```

## Starten

Führe im Terminal diesen Befehl aus:
```bash
node index.js
```
Sobald "Erfolgreich eingeloggt!" in der Konsole steht, ist der Bot bereit.

## Wichtige Hinweise
- Damit die Slash-Befehle funktionieren, musst du deinen Bot mit dem OAuth2 Scope `applications.commands` und `bot` auf deinen Server einladen.
- Gib dem Bot die Berechtigungen "Nachrichten lesen", "Nachrichten senden", sowie "Verbinden" und "Sprechen" für die Sprachkanäle.
- TTS Nachrichten müssen in den Servereinstellungen für die Rolle des Bots erlaubt sein.
