# Avatar Chatbot — Next.js + Rive + Ollama

Chatbot lokal dengan avatar Rive, streaming response dari Ollama.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Pastikan Ollama berjalan
```bash
# Install Ollama dari https://ollama.ai, lalu:
ollama serve

# Pull model (pilih salah satu):
ollama pull llama3
ollama pull llama3.2
ollama pull mistral
```

### 3. Jalankan dev server
```bash
npm run dev
```

Buka http://localhost:3000

---

## Struktur file Rive

File `public/avatar.riv` dibaca dengan konfigurasi:
- **Artboard**: `Avatar`
- **State Machine**: `State Machine 1`

Avatar akan mencoba trigger input berikut secara otomatis:
- `talk` — saat bot menjawab
- `think` — saat bot sedang memproses
- `idle` — saat tidak ada aktivitas

Kalau state machine punya nama input yang berbeda, sesuaikan di `components/avatar/RiveAvatar.tsx`.

---

## Animasi yang ada

| State | Avatar | Visual |
|---|---|---|
| `idle` | Animasi default | Glow putih tipis |
| `thinking` | Input `think` | Glow biru + typing indicator |
| `talking` | Input `talk` + bounce | Glow oranye + waveform bars + streaming text |
