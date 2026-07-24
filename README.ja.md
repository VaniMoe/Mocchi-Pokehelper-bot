# Pokétwo Helper Bot

[English](README.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [Français](README.fr.md)

「Pokétwo」ボットから出現する野生のポケモンを特定するのに役立つDiscordボットです。ボットは公式のGoogle Gemini AIを使用してDiscordからの画像を分析し、ポケモンの英語名を出力します。さらに、新しいポケモンが出現したときに、特定のボイスチャンネルにTTS（テキスト読み上げ）通知を送信します。

## 機能

- `/helpme`: 現在のチャンネルで最後に出現したPokétwoを見つけ、Gemini AI（画像認識）を使用してポケモンの名前を特定します。
- `/testtts`: 設定されたボイスチャンネルにテスト通知を送信します。
- **自動検出**: Pokétwoが新しい野生のポケモンを投稿するとすぐに、ボットは特定のボイスチャンネルに参加し、通知を読み上げて退出します。

## 必須条件

- [Node.js](https://nodejs.org/en/) (バージョン16.14.0以上)
- 自身のDiscord Bot TokenとClient ID ([Discord Developer Portal](https://discord.com/developers/applications))
- Google Gemini APIキー ([Google AI Studio](https://aistudio.google.com/))

## インストール

1. **リポジトリのクローン**  
   このリポジトリをコンピューターにクローンします（またはZIPファイルをダウンロードします）。

2. **依存関係のインストール**  
   ボットのディレクトリでターミナルを開き、次のコマンドを実行します:
   ```bash
   npm install
   ```

3. **設定の作成**  
   `config.example.json`ファイルをコピーし、`config.json`に名前を変更します。
   次に、トークンと設定を`config.json`に入力します:
   ```json
   {
     "token": "あなたのDISCORDボットトークン",
     "clientId": "あなたのDISCORDクライアントID",
     "geminiApiKey": "あなたのGEMINI_APIキー",
     "voiceChannelId": "あなたのボイスチャンネルID",
     "ttsMessage": "ボットが読み上げるテキスト"
   }
   ```

## 起動

ターミナルでこのコマンドを実行します:
```bash
node index.js
```
コンソールに「Erfolgreich eingeloggt!」と表示されたら、ボットの準備は完了です。

## 重要な注意事項
- スラッシュコマンドを機能させるには、OAuth2スコープの`applications.commands`と`bot`を使用して、ボットをサーバーに招待する必要があります。
- ボットに「メッセージを読む」、「メッセージを送信する」、およびボイスチャンネルの「接続」と「発言」の権限を付与してください。
- ボットの役割に対して、サーバー設定でTTSメッセージが許可されている必要があります。
