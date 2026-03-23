using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace Insimul.Services
{
    /// <summary>
    /// P/Invoke wrapper for llama.cpp native plugin.
    /// Provides low-level access to LLM inference, Piper TTS, and Whisper STT.
    /// Use LocalAIService for the high-level MonoBehaviour API.
    /// </summary>
    public static class LlamaNativePlugin
    {
#if UNITY_IOS && !UNITY_EDITOR
        private const string LlamaLib = "__Internal";
        private const string PiperLib = "__Internal";
        private const string WhisperLib = "__Internal";
#else
        private const string LlamaLib = "llama";
        private const string PiperLib = "piper_phonemize";
        private const string WhisperLib = "whisper";
#endif

        // ─── llama.cpp bindings ───

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern void llama_backend_init();

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern void llama_backend_free();

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr llama_model_default_params();

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr llama_load_model_from_file(
            [MarshalAs(UnmanagedType.LPStr)] string path_model,
            IntPtr model_params);

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern void llama_free_model(IntPtr model);

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr llama_new_context_with_model(IntPtr model, IntPtr ctx_params);

        [DllImport(LlamaLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern void llama_free(IntPtr ctx);

        // ─── Whisper bindings ───

        [DllImport(WhisperLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern IntPtr whisper_init_from_file(
            [MarshalAs(UnmanagedType.LPStr)] string path_model);

        [DllImport(WhisperLib, CallingConvention = CallingConvention.Cdecl)]
        public static extern void whisper_free(IntPtr ctx);

        // ─── Availability check ───

        /// <summary>
        /// Tests whether the native libraries are available at runtime.
        /// Returns false on platforms without the native plugin.
        /// </summary>
        public static bool IsAvailable()
        {
            try
            {
                llama_backend_init();
                llama_backend_free();
                return true;
            }
            catch (DllNotFoundException)
            {
                return false;
            }
            catch (EntryPointNotFoundException)
            {
                return false;
            }
        }
    }
}
