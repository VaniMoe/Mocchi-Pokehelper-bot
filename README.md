# Pokétwo Helper Bot

[English](README.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [Français](README.fr.md)

A Discord bot that helps you identify wild Pokémon spawns from the "Pokétwo" bot. The bot uses the official Google Gemini AI to analyze images from Discord and outputs the English name of the Pokémon. Additionally, the bot sends a TTS (Text-to-Speech) notification to a specific voice channel when a new Pokémon appears.

## Features

- **Web Dashboard:** Starts automatically at `http://localhost:3000`. Shows a live history of identified Pokémon with images, live bot logs, and a settings menu to easily update your configuration!
- `/helpme`: Finds the last Pokétwo spawn in the current channel and uses Gemini AI (image recognition) to name the requested Pokémon.
- `/testtts`: Sends a test notification to the configured voice channel.
- **Automatic Detection**: As soon as Pokétwo posts a new wild Pokémon, the bot joins a specific voice channel, reads a notification aloud, and leaves.

## Requirements

- [Node.js](https://nodejs.org/en/) (Version 16.14.0 or newer)
- Your own Discord Bot Token & Client ID ([Discord Developer Portal](https://discord.com/developers/applications))
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

## Installation

1. **Clone Repository**  
   Clone this repository to your computer (or download the ZIP file).

2. **Install Dependencies**  
   Open a terminal in the bot's directory and run the following command:
   ```bash
   npm install
   ```

3. **Create Configuration**  
   Copy the `config.example.json` file and rename it to `config.json`.
   Then enter your tokens and settings into the `config.json`:
   ```json
   {
     "token": "YOUR_DISCORD_BOT_TOKEN",
     "clientId": "YOUR_DISCORD_CLIENT_ID",
     "geminiApiKey": "YOUR_GEMINI_API_KEY",
     "voiceChannelId": "YOUR_VOICE_CHANNEL_ID",
     "ttsMessage": "Text the bot should read aloud"
   }
   ```

## Starting

Run this command in the terminal:
```bash
node index.js
```
Once "Erfolgreich eingeloggt!" appears in the console, the bot is ready.

## Important Notes
- For slash commands to work, you must invite your bot to your server with the OAuth2 scopes `applications.commands` and `bot`.
- Give the bot the permissions "Read Messages", "Send Messages", as well as "Connect" and "Speak" for voice channels.
- TTS messages must be allowed in the server settings for the bot's role.

## Changelog

- **v1.3.0**: Added `/pokedex` command with AI-powered translation for multi-language search. Upgraded embeds with official artwork thumbnails, type emojis, German names, flavor text, and detailed abilities (including hidden ones).
- **v1.2.0**: Mega-Update! Added PokéAPI integration for detailed Pokémon stats, legendary spawn detection with alarms, copy-paste quick catch commands, TTS language selection, and statistics tracking on the dashboard!
- **v1.1.0**: Added Web Dashboard with live logs, Pokémon history, and dynamic settings.
- **v1.0.0**: Initial release with Gemini AI Pokémon recognition and TTS notifications.
