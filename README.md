# 👨‍💻 Transcriber

`transcriber` é uma biblioteca TypeScript que encapsula a CLI do `whisper.cpp` para permitir transcrição de fala para texto localmente a partir do Node.js.

## 📝 Requisitos

- Um binário `whisper.cpp` compilado em `bin/whisper` (ou `bin/whisper.exe` no Windows)
- Um arquivo de modelo como `ggml-base.bin` em `models/ggml-base.bin`

Você pode baixar modelos dos releases oficiais do `whisper.cpp` ou compilá-los seguindo as instruções no repositório upstream.

## 🙋🏻‍♂️ Uso

```ts
import { transcribe } from "transcriber";

const result = await transcribe({
  file: "audio.wav",
  language: "pt",
});

console.log(result.text);
```

## 📑 Opções

- `modelPath`: Substitui o caminho do arquivo de modelo. Padrão: `models/ggml-base.bin`
- `threads`: Define o número de threads de CPU para usar com o `whisper.cpp`
- `translate`: Quando true, o `whisper.cpp` traduzirá a fala para inglês

## 🛠️ Helpers para binário e modelo

- `checkWhisperBinary()` verifica se o binário existe e retorna o caminho resolvido
- `checkModel()` verifica se o modelo existe e retorna o caminho resolvido

## 📋 Notas

Esta biblioteca apenas orquestra a CLI do `whisper.cpp` e não reimplementa nenhuma inferência do Whisper.
