# Avatar Chatbot — Next.js + Rive + Ollama

Chatbot lokal dengan avatar Rive, streaming response dari Ollama.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a file named `.env.local` in the root directory and add:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
NEXT_PUBLIC_APP_NAME="Avatar AI Chatbot"
NEXT_PUBLIC_DEFAULT_MODEL=llama3

# Rive Configuration
NEXT_PUBLIC_RIVE_SRC="/avatar.rev"
NEXT_PUBLIC_RIVE_ARTBOARD="Avatar"
NEXT_PUBLIC_RIVE_STATE_MACHINE="State Machine 1"
```

### 3. Pastikan Ollama berjalan

```bash
# Install Ollama dari https://ollama.ai, lalu:
ollama serve

# Pull model (sesuai OLLAMA_MODEL):
ollama pull llama3
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka http://localhost:3000

---

## Struktur file Rive

File `public/avatar.rev` dibaca dengan konfigurasi:

- **Artboard**: `Avatar`
- **State Machine**: `State Machine 1`

Avatar akan mencoba trigger input berikut secara otomatis:

- `talk` — saat bot menjawab
- `think` — saat bot sedang memproses
- `idle` — saat tidak ada aktivitas

Kalau state machine punya nama input yang berbeda, sesuaikan di `components/avatar/RiveAvatar.tsx`.

---

## Animasi yang ada

| State      | Avatar                | Visual                                       |
| ---------- | --------------------- | -------------------------------------------- |
| `idle`     | Animasi default       | Glow putih tipis                             |
| `thinking` | Input `think`         | Glow biru + typing indicator                 |
| `talking`  | Input `talk` + bounce | Glow oranye + waveform bars + streaming text |
