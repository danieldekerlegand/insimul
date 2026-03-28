#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# setup-local-ai.sh — Download and install local AI models for Insimul
#
# Downloads:
#   • GGUF LLM model (phi-4-mini-q4, ~2.5 GB)
#   • Piper TTS voice models (.onnx + config JSON, ~20-50 MB each)
#   • Whisper STT model (ggml-base, ~150 MB)
#   • Piper binary (platform-specific)
#   • Whisper.cpp binary (platform-specific)
#
# Usage:
#   ./scripts/setup-local-ai.sh              # Download everything
#   ./scripts/setup-local-ai.sh --llm-only   # Just the LLM model
#   ./scripts/setup-local-ai.sh --tts-only   # Just Piper voices + binary
#   ./scripts/setup-local-ai.sh --stt-only   # Just Whisper model + binary
#   ./scripts/setup-local-ai.sh --binaries   # Just Piper + Whisper binaries
#   ./scripts/setup-local-ai.sh --status     # Show what's installed
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MODELS_DIR="$PROJECT_ROOT/models"
BIN_DIR="$PROJECT_ROOT/models/bin"
VOICES_DIR="$MODELS_DIR/piper-voices"

# Model URLs (pinned versions for reproducibility)
# Qwen2.5-3B-Instruct is public (no HuggingFace auth required), multilingual, ~2 GB Q4
LLM_MODEL_NAME="${LOCAL_MODEL_NAME:-qwen2.5-3b-instruct-q4_k_m}"
LLM_MODEL_URL="https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf"
LLM_MODEL_FILE="$MODELS_DIR/${LLM_MODEL_NAME}.gguf"

WHISPER_MODEL_SIZE="${WHISPER_MODEL_SIZE:-base}"
WHISPER_MODEL_URL="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${WHISPER_MODEL_SIZE}.bin"
WHISPER_MODEL_FILE="$MODELS_DIR/whisper-${WHISPER_MODEL_SIZE}.bin"

# Piper voice models — English + French (the primary Insimul languages)
# Each voice needs both .onnx and .onnx.json files
# Using parallel arrays for Bash 3.2 compatibility (macOS default)
PIPER_BASE_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"
PIPER_VOICE_NAMES=(
  # English voices
  "en_US-lessac-medium"
  "en_US-amy-medium"
  "en_US-ryan-medium"
  "en_US-arctic-medium"
  "en_US-ljspeech-medium"
  "en_US-lessac-low"
  # French voices
  "fr_FR-siwis-medium"
  "fr_FR-tom-medium"
)
PIPER_VOICE_PATHS=(
  "en/en_US/lessac/medium"
  "en/en_US/amy/medium"
  "en/en_US/ryan/medium"
  "en/en_US/arctic/medium"
  "en/en_US/ljspeech/medium"
  "en/en_US/lessac/low"
  "fr/fr_FR/siwis/medium"
  "fr/fr_FR/tom/medium"
)

# Piper binary releases
PIPER_VERSION="2023.11.14-2"
WHISPER_CPP_VERSION="1.7.4"

# ── Helpers ───────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()   { echo -e "${BLUE}[setup-local-ai]${NC} $*"; }
ok()    { echo -e "${GREEN}  ✓${NC} $*"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $*"; }
error() { echo -e "${RED}  ✗${NC} $*"; }

# Detect platform
detect_platform() {
  local os arch
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$os" in
    Darwin)
      case "$arch" in
        arm64) echo "macos-arm64" ;;
        *)     echo "macos-x64" ;;
      esac
      ;;
    Linux)
      case "$arch" in
        aarch64) echo "linux-arm64" ;;
        *)       echo "linux-x64" ;;
      esac
      ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "windows-x64"
      ;;
    *)
      error "Unsupported platform: $os/$arch"
      exit 1
      ;;
  esac
}

# Download with progress bar, skip if already exists
download() {
  local url="$1" dest="$2" label="$3"

  if [[ -f "$dest" ]]; then
    local size
    size=$(stat -f%z "$dest" 2>/dev/null || stat --printf="%s" "$dest" 2>/dev/null || echo "0")
    local size_mb=$(( size / 1024 / 1024 ))
    ok "$label already downloaded (${size_mb} MB)"
    return 0
  fi

  log "Downloading $label..."
  mkdir -p "$(dirname "$dest")"

  if command -v curl &>/dev/null; then
    curl -L --progress-bar -o "$dest" "$url"
  elif command -v wget &>/dev/null; then
    wget --show-progress -qO "$dest" "$url"
  else
    error "Neither curl nor wget found. Install one and retry."
    exit 1
  fi

  if [[ -f "$dest" ]]; then
    local size
    size=$(stat -f%z "$dest" 2>/dev/null || stat --printf="%s" "$dest" 2>/dev/null || echo "0")
    local size_mb=$(( size / 1024 / 1024 ))
    ok "$label downloaded (${size_mb} MB)"
  else
    error "Failed to download $label"
    return 1
  fi
}

# ── Download Functions ────────────────────────────────────────────────

download_llm() {
  log "Setting up LLM model..."
  download "$LLM_MODEL_URL" "$LLM_MODEL_FILE" "LLM model ($LLM_MODEL_NAME)"
}

download_tts_voices() {
  log "Setting up Piper TTS voices..."
  mkdir -p "$VOICES_DIR"

  local i
  for i in "${!PIPER_VOICE_NAMES[@]}"; do
    local voice_name="${PIPER_VOICE_NAMES[$i]}"
    local voice_path="${PIPER_VOICE_PATHS[$i]}"
    local onnx_url="${PIPER_BASE_URL}/${voice_path}/${voice_name}.onnx"
    local json_url="${PIPER_BASE_URL}/${voice_path}/${voice_name}.onnx.json"

    download "$onnx_url" "$VOICES_DIR/${voice_name}.onnx" "Voice: $voice_name (.onnx)"
    download "$json_url" "$VOICES_DIR/${voice_name}.onnx.json" "Voice: $voice_name (.json)"
  done
}

download_stt() {
  log "Setting up Whisper STT model..."
  download "$WHISPER_MODEL_URL" "$WHISPER_MODEL_FILE" "Whisper ${WHISPER_MODEL_SIZE} model"
}

download_piper_binary() {
  local platform
  platform="$(detect_platform)"
  log "Setting up Piper binary for $platform..."
  mkdir -p "$BIN_DIR"

  local piper_archive piper_url
  case "$platform" in
    macos-arm64)
      piper_archive="piper_macos_aarch64.tar.gz"
      ;;
    macos-x64)
      piper_archive="piper_macos_x64.tar.gz"
      ;;
    linux-x64)
      piper_archive="piper_linux_x86_64.tar.gz"
      ;;
    linux-arm64)
      piper_archive="piper_linux_aarch64.tar.gz"
      ;;
    windows-x64)
      piper_archive="piper_windows_amd64.zip"
      ;;
  esac

  piper_url="https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/${piper_archive}"

  if [[ -f "$BIN_DIR/piper" ]] || [[ -f "$BIN_DIR/piper.exe" ]]; then
    ok "Piper binary already installed"
    return 0
  fi

  local tmp_archive="$BIN_DIR/${piper_archive}"
  download "$piper_url" "$tmp_archive" "Piper binary"

  log "Extracting Piper..."
  if [[ "$piper_archive" == *.tar.gz ]]; then
    tar -xzf "$tmp_archive" -C "$BIN_DIR" --strip-components=1
  else
    unzip -qo "$tmp_archive" -d "$BIN_DIR"
  fi
  rm -f "$tmp_archive"

  # Make binary executable
  chmod +x "$BIN_DIR/piper" 2>/dev/null || true
  ok "Piper binary installed"
}

download_whisper_binary() {
  local platform
  platform="$(detect_platform)"
  log "Setting up Whisper.cpp binary for $platform..."
  mkdir -p "$BIN_DIR"

  if [[ -f "$BIN_DIR/whisper-cpp" ]] || [[ -f "$BIN_DIR/whisper-cli" ]] || [[ -f "$BIN_DIR/whisper.exe" ]]; then
    ok "Whisper.cpp binary already installed"
    return 0
  fi

  # whisper.cpp doesn't ship macOS/Linux prebuilt binaries — use Homebrew or build from source
  case "$platform" in
    macos-arm64|macos-x64)
      if command -v brew &>/dev/null; then
        log "Installing whisper.cpp via Homebrew..."
        brew install whisper-cpp 2>/dev/null || true
        local brew_whisper
        brew_whisper="$(brew --prefix whisper-cpp 2>/dev/null)/bin/whisper-cpp" || true
        if [[ -f "$brew_whisper" ]]; then
          cp "$brew_whisper" "$BIN_DIR/whisper-cpp"
          chmod +x "$BIN_DIR/whisper-cpp"
          ok "Whisper.cpp installed via Homebrew"
          return 0
        fi
        # Some versions install as 'whisper-cli'
        brew_whisper="$(brew --prefix whisper-cpp 2>/dev/null)/bin/whisper-cli" || true
        if [[ -f "$brew_whisper" ]]; then
          cp "$brew_whisper" "$BIN_DIR/whisper-cpp"
          chmod +x "$BIN_DIR/whisper-cpp"
          ok "Whisper.cpp installed via Homebrew"
          return 0
        fi
      fi
      # Check if already on PATH
      if command -v whisper-cpp &>/dev/null; then
        cp "$(command -v whisper-cpp)" "$BIN_DIR/whisper-cpp"
        ok "Whisper.cpp copied from system PATH"
        return 0
      fi
      if command -v whisper-cli &>/dev/null; then
        cp "$(command -v whisper-cli)" "$BIN_DIR/whisper-cpp"
        ok "Whisper.cpp copied from system PATH (whisper-cli)"
        return 0
      fi
      warn "Whisper.cpp not available. Install with: brew install whisper-cpp"
      ;;
    linux-x64|linux-arm64)
      # Try building from source
      if command -v cmake &>/dev/null && command -v make &>/dev/null; then
        log "Building whisper.cpp from source..."
        local tmp_build="$BIN_DIR/whisper-build"
        git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git "$tmp_build" 2>/dev/null
        if [[ -d "$tmp_build" ]]; then
          cmake -S "$tmp_build" -B "$tmp_build/build" -DCMAKE_BUILD_TYPE=Release 2>/dev/null
          cmake --build "$tmp_build/build" --target whisper-cli -j "$(nproc)" 2>/dev/null
          if [[ -f "$tmp_build/build/bin/whisper-cli" ]]; then
            cp "$tmp_build/build/bin/whisper-cli" "$BIN_DIR/whisper-cpp"
            chmod +x "$BIN_DIR/whisper-cpp"
            ok "Whisper.cpp built from source"
          else
            warn "Whisper.cpp build failed"
          fi
          rm -rf "$tmp_build"
          return 0
        fi
      fi
      warn "Whisper.cpp not available. Install cmake and make, or build manually from https://github.com/ggml-org/whisper.cpp"
      ;;
    windows-x64)
      local whisper_url="https://github.com/ggml-org/whisper.cpp/releases/download/v${WHISPER_CPP_VERSION}/whisper-bin-x64.zip"
      local tmp_archive="$BIN_DIR/whisper-bin-x64.zip"
      download "$whisper_url" "$tmp_archive" "Whisper.cpp binary"
      unzip -qo "$tmp_archive" -d "$BIN_DIR" 2>/dev/null
      rm -f "$tmp_archive"
      # Find the whisper-cli.exe or main.exe
      if [[ -f "$BIN_DIR/whisper-cli.exe" ]]; then
        mv "$BIN_DIR/whisper-cli.exe" "$BIN_DIR/whisper.exe" 2>/dev/null || true
      fi
      ok "Whisper.cpp installed"
      ;;
  esac

  # Rename whisper-cli to whisper-cpp if needed
  if [[ -f "$BIN_DIR/whisper-cli" ]] && [[ ! -f "$BIN_DIR/whisper-cpp" ]]; then
    mv "$BIN_DIR/whisper-cli" "$BIN_DIR/whisper-cpp"
  fi

  chmod +x "$BIN_DIR/whisper-cpp" 2>/dev/null || true
  ok "Whisper.cpp binary installed"
}

# ── Status Report ─────────────────────────────────────────────────────

show_status() {
  echo ""
  log "Local AI Status"
  echo "  ─────────────────────────────────────────"

  # LLM
  if [[ -f "$LLM_MODEL_FILE" ]]; then
    local size
    size=$(stat -f%z "$LLM_MODEL_FILE" 2>/dev/null || stat --printf="%s" "$LLM_MODEL_FILE" 2>/dev/null || echo "0")
    ok "LLM model: $LLM_MODEL_NAME ($(( size / 1024 / 1024 )) MB)"
  else
    warn "LLM model: not downloaded"
  fi

  # Piper binary
  if [[ -f "$BIN_DIR/piper" ]] || [[ -f "$BIN_DIR/piper.exe" ]]; then
    ok "Piper binary: installed"
  else
    warn "Piper binary: not installed"
  fi

  # Voices
  if [[ -d "$VOICES_DIR" ]]; then
    local voice_count
    voice_count=$(find "$VOICES_DIR" -name "*.onnx" 2>/dev/null | wc -l | tr -d ' ')
    if (( voice_count > 0 )); then
      ok "Piper voices: $voice_count voice(s) installed"
      for f in "$VOICES_DIR"/*.onnx; do
        local name
        name=$(basename "$f" .onnx)
        local size
        size=$(stat -f%z "$f" 2>/dev/null || stat --printf="%s" "$f" 2>/dev/null || echo "0")
        echo "     - $name ($(( size / 1024 / 1024 )) MB)"
      done
    else
      warn "Piper voices: none downloaded"
    fi
  else
    warn "Piper voices: directory not found"
  fi

  # Whisper binary
  if [[ -f "$BIN_DIR/whisper-cpp" ]] || [[ -f "$BIN_DIR/main" ]] || [[ -f "$BIN_DIR/whisper.exe" ]]; then
    ok "Whisper.cpp binary: installed"
  else
    warn "Whisper.cpp binary: not installed"
  fi

  # Whisper model
  if [[ -f "$WHISPER_MODEL_FILE" ]]; then
    local size
    size=$(stat -f%z "$WHISPER_MODEL_FILE" 2>/dev/null || stat --printf="%s" "$WHISPER_MODEL_FILE" 2>/dev/null || echo "0")
    ok "Whisper model: ${WHISPER_MODEL_SIZE} ($(( size / 1024 / 1024 )) MB)"
  else
    warn "Whisper model: not downloaded"
  fi

  echo "  ─────────────────────────────────────────"

  # Total size
  local total=0
  if [[ -d "$MODELS_DIR" ]]; then
    total=$(du -sm "$MODELS_DIR" 2>/dev/null | awk '{print $1}')
  fi
  log "Total models directory: ${total} MB"

  echo ""
  log "Environment variables for .env:"
  echo "  AI_PROVIDER=local"
  echo "  LOCAL_MODEL_PATH=$LLM_MODEL_FILE"
  echo "  LOCAL_MODEL_NAME=$LLM_MODEL_NAME"
  echo "  PIPER_VOICES_DIR=$VOICES_DIR"
  echo "  PIPER_BINARY=$BIN_DIR/piper"
  echo "  WHISPER_CPP_PATH=$BIN_DIR/whisper-cpp"
  echo "  WHISPER_MODEL_PATH=$WHISPER_MODEL_FILE"
  echo "  WHISPER_MODEL_SIZE=$WHISPER_MODEL_SIZE"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────

main() {
  log "Insimul Local AI Setup"
  log "Platform: $(detect_platform)"
  log "Models directory: $MODELS_DIR"
  echo ""

  mkdir -p "$MODELS_DIR"

  case "${1:-all}" in
    --llm-only)
      download_llm
      ;;
    --tts-only)
      download_tts_voices
      download_piper_binary
      ;;
    --stt-only)
      download_stt
      download_whisper_binary
      ;;
    --binaries)
      download_piper_binary
      download_whisper_binary
      ;;
    --status)
      show_status
      exit 0
      ;;
    --help|-h)
      echo "Usage: $0 [--llm-only|--tts-only|--stt-only|--binaries|--status|--help]"
      echo ""
      echo "  (no args)   Download everything (LLM + TTS + STT + binaries)"
      echo "  --llm-only  Download only the GGUF LLM model"
      echo "  --tts-only  Download Piper voices + binary"
      echo "  --stt-only  Download Whisper model + binary"
      echo "  --binaries  Download only Piper and Whisper binaries"
      echo "  --status    Show what's currently installed"
      echo "  --help      Show this help"
      exit 0
      ;;
    all|"")
      download_llm
      download_tts_voices
      download_stt
      download_piper_binary
      download_whisper_binary
      ;;
    *)
      error "Unknown option: $1"
      echo "Run $0 --help for usage"
      exit 1
      ;;
  esac

  echo ""
  show_status
}

main "$@"
