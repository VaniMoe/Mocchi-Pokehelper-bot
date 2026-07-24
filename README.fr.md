# Pokétwo Helper Bot

[English](README.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [Français](README.fr.md)

Un bot Discord qui vous aide à identifier l'apparition de Pokémon sauvages du bot "Pokétwo". Le bot utilise l'IA officielle Google Gemini pour analyser les images de Discord et affiche le nom anglais du Pokémon. De plus, le bot envoie une notification TTS (Text-to-Speech) à un canal vocal spécifique lorsqu'un nouveau Pokémon apparaît.

## Fonctionnalités

- `/helpme`: Trouve la dernière apparition de Pokétwo dans le canal actuel et utilise l'IA Gemini (reconnaissance d'image) pour nommer le Pokémon.
- `/testtts`: Envoie une notification de test au canal vocal configuré.
- **Détection automatique**: Dès que Pokétwo publie un nouveau Pokémon sauvage, le bot rejoint un canal vocal spécifique, lit une notification à voix haute et part.

## Prérequis

- [Node.js](https://nodejs.org/en/) (Version 16.14.0 ou supérieure)
- Votre propre Token de Bot Discord et Client ID ([Discord Developer Portal](https://discord.com/developers/applications))
- Une clé API Google Gemini ([Google AI Studio](https://aistudio.google.com/))

## Installation

1. **Cloner le dépôt**  
   Clonez ce dépôt sur votre ordinateur (ou téléchargez le fichier ZIP).

2. **Installer les dépendances**  
   Ouvrez un terminal dans le répertoire du bot et exécutez la commande suivante :
   ```bash
   npm install
   ```

3. **Créer la configuration**  
   Copiez le fichier `config.example.json` et renommez-le en `config.json`.
   Entrez ensuite vos jetons et paramètres dans le `config.json` :
   ```json
   {
     "token": "VOTRE_TOKEN_DISCORD",
     "clientId": "VOTRE_CLIENT_ID_DISCORD",
     "geminiApiKey": "VOTRE_API_KEY_GEMINI",
     "voiceChannelId": "ID_DE_VOTRE_CANAL_VOCAL",
     "ttsMessage": "Texte que le bot doit lire"
   }
   ```

## Démarrage

Exécutez cette commande dans le terminal :
```bash
node index.js
```
Une fois que "Erfolgreich eingeloggt!" apparaît dans la console, le bot est prêt.

## Remarques importantes
- Pour que les commandes slash fonctionnent, vous devez inviter votre bot sur votre serveur avec les scopes OAuth2 `applications.commands` et `bot`.
- Donnez au bot les permissions "Lire les messages", "Envoyer des messages", ainsi que "Se connecter" et "Parler" pour les canaux vocaux.
- Les messages TTS doivent être autorisés dans les paramètres du serveur pour le rôle du bot.

## Historique des mises à jour

- **v1.1.0**: Ajout du tableau de bord Web avec journaux en direct, historique des Pokémon et paramètres dynamiques.
- **v1.0.0**: Version initiale avec reconnaissance de Pokémon via l'IA Gemini et notifications TTS.
