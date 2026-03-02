# Avatar Chatbot — Next.js + Rive + Ollama

Local chatbot with Rive avatar animation and streaming responses from Ollama.

---

## ⚠ Important Note About Rive Usage

- Rive is a **paid tool** (depending on license and usage).
- For public or online deployment, the animation file must use the correct `.riv` format.
- Currently, for publication purposes, the available file may use an incorrect extension (e.g. renamed to `.rev`), which causes:
  - Animation not loading
  - File being treated as corrupted
  - Online preview not working

To ensure proper functionality:

- Export the animation from Rive as a valid `.riv` file.
- Place the `.riv` file inside the `/public` directory.
- Make sure the environment variable matches the correct filename.

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Configure Environment Variables

Create a file named `.env.local` in the root directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
NEXT_PUBLIC_APP_NAME="Avatar AI Chatbot"
NEXT_PUBLIC_DEFAULT_MODEL=llama3

# Rive Configuration
NEXT_PUBLIC_RIVE_SRC="/avatar.riv"
NEXT_PUBLIC_RIVE_ARTBOARD="Avatar"
NEXT_PUBLIC_RIVE_STATE_MACHINE="State Machine 1"
```

> Ensure the filename matches the actual `.riv` file inside `/public`.

---

### 3. Make Sure Ollama Is Running

Install Ollama from:  
https://ollama.ai

Start the server:

```bash
ollama serve
```

Pull the model (based on `OLLAMA_MODEL`):

```bash
ollama pull llama3
```

---

### 4. Run the Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Rive File Structure

The file located at:

```
public/avatar.riv
```

Is loaded using this configuration:

- **Artboard:** `Avatar`
- **State Machine:** `State Machine 1`

If your Rive file uses different names, update:

```
components/avatar/RiveAvatar.tsx
```

---

## Expected State Machine Inputs

The avatar automatically triggers the following inputs:

| Input   | Triggered When |
|----------|----------------|
| `talk`   | When the bot is responding |
| `think`  | When the bot is processing |
| `idle`   | When there is no activity |

If your state machine uses different input names, adjust them in:

```
components/avatar/RiveAvatar.tsx
```

---

## Available Animation States

| State     | Avatar Behavior | Visual Effect |
|------------|-----------------|---------------|
| `idle`     | Default animation | Subtle white glow |
| `thinking` | `think` input | Blue glow + typing indicator |
| `talking`  | `talk` input + bounce | Orange glow + waveform bars + streaming text |

---

## ⚠ Common Issues

### Animation Not Playing

- Ensure the file extension is `.riv`
- Do not manually rename file extensions
- Verify the file is not corrupted
- Confirm artboard and state machine names match the configuration

If the file was renamed improperly (e.g. `.rev` instead of `.riv`), the animation will fail to load.
