# Pokétwo Helper Bot

[English](README.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [Français](README.fr.md)

Un bot de Discord que te ayuda a identificar los Pokémon salvajes que aparecen del bot "Pokétwo". El bot utiliza la IA oficial de Google Gemini para analizar imágenes de Discord y muestra el nombre en inglés del Pokémon. Además, el bot envía una notificación TTS (texto a voz) a un canal de voz específico cuando aparece un nuevo Pokémon.

## Características

- `/helpme`: Encuentra la última aparición de Pokétwo en el canal actual y utiliza la IA de Gemini (reconocimiento de imágenes) para nombrar al Pokémon.
- `/testtts`: Envía una notificación de prueba al canal de voz configurado.
- **Detección automática**: Tan pronto como Pokétwo publica un nuevo Pokémon salvaje, el bot se une a un canal de voz específico, lee una notificación en voz alta y se va.

## Requisitos

- [Node.js](https://nodejs.org/en/) (Versión 16.14.0 o superior)
- Tu propio Token de Bot de Discord y Client ID ([Discord Developer Portal](https://discord.com/developers/applications))
- Una clave API de Google Gemini ([Google AI Studio](https://aistudio.google.com/))

## Instalación

1. **Clonar repositorio**  
   Clona este repositorio en tu computadora (o descarga el archivo ZIP).

2. **Instalar dependencias**  
   Abre una terminal en el directorio del bot y ejecuta el siguiente comando:
   ```bash
   npm install
   ```

3. **Crear configuración**  
   Copia el archivo `config.example.json` y renómbralo a `config.json`.
   Luego ingresa tus tokens y ajustes en `config.json`:
   ```json
   {
     "token": "TU_TOKEN_DE_DISCORD",
     "clientId": "TU_CLIENT_ID_DE_DISCORD",
     "geminiApiKey": "TU_API_KEY_DE_GEMINI",
     "voiceChannelId": "ID_DE_TU_CANAL_DE_VOZ",
     "ttsMessage": "Texto que el bot debe leer"
   }
   ```

## Iniciar

Ejecuta este comando en la terminal:
```bash
node index.js
```
Una vez que aparezca "Erfolgreich eingeloggt!" en la consola, el bot estará listo.

## Notas importantes
- Para que los comandos slash funcionen, debes invitar al bot a tu servidor con los ámbitos OAuth2 `applications.commands` y `bot`.
- Otorga al bot los permisos "Leer mensajes", "Enviar mensajes", así como "Conectar" y "Hablar" para los canales de voz.
- Los mensajes TTS deben estar permitidos en la configuración del servidor para el rol del bot.
