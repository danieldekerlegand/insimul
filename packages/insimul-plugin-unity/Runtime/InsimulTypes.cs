using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace Insimul
{
    // --- Enums ---

    public enum InsimulAudioEncoding
    {
        Unspecified = 0,
        PCM = 1,
        OPUS = 2,
        MP3 = 3
    }

    public enum InsimulConversationState
    {
        Unspecified = 0,
        Started = 1,
        Active = 2,
        Paused = 3,
        Ended = 4
    }

    // --- Data Structs ---

    [Serializable]
    public struct InsimulViseme
    {
        public string phoneme;
        public float weight;
        public float durationMs;
    }

    [Serializable]
    public struct InsimulFacialData
    {
        public InsimulViseme[] visemes;
    }

    [Serializable]
    public struct InsimulTextChunk
    {
        public string text;
        public bool isFinal;
    }

    [Serializable]
    public struct InsimulAudioChunk
    {
        public byte[] data;
        public InsimulAudioEncoding encoding;
        public int sampleRate;
        public int durationMs;
    }

    [Serializable]
    public struct InsimulActionTrigger
    {
        public string actionType;
        public string targetId;
        public Dictionary<string, string> parameters;
    }

    [Serializable]
    public struct InsimulConfig
    {
        public string serverUrl;
        public string apiKey;
        public string worldId;
        public string languageCode;
    }

    // --- JSON Deserialization Helpers ---

    [Serializable]
    internal class SSETextEvent
    {
        public string type;
        public string text;
        public bool isFinal;
    }

    [Serializable]
    internal class SSEAudioEvent
    {
        public string type;
        public string data;
        public int encoding;
        public int sampleRate;
        public int durationMs;
    }

    [Serializable]
    internal class SSEFacialEvent
    {
        public string type;
        public SSEViseme[] visemes;
    }

    [Serializable]
    internal class SSEViseme
    {
        public string phoneme;
        public float weight;
        public float durationMs;
    }

    [Serializable]
    internal class SSETranscriptEvent
    {
        public string type;
        public string text;
    }

    [Serializable]
    internal class SSEErrorEvent
    {
        public string type;
        public string message;
    }

    [Serializable]
    internal class SSEBaseEvent
    {
        public string type;
    }

    // --- Unity Events ---

    [Serializable]
    public class InsimulTextChunkEvent : UnityEvent<InsimulTextChunk> { }

    [Serializable]
    public class InsimulAudioChunkEvent : UnityEvent<InsimulAudioChunk> { }

    [Serializable]
    public class InsimulFacialDataEvent : UnityEvent<InsimulFacialData> { }

    [Serializable]
    public class InsimulActionTriggerEvent : UnityEvent<InsimulActionTrigger> { }

    [Serializable]
    public class InsimulTranscriptEvent : UnityEvent<string> { }

    [Serializable]
    public class InsimulStateChangeEvent : UnityEvent<InsimulConversationState> { }

    [Serializable]
    public class InsimulErrorEvent : UnityEvent<string> { }
}
