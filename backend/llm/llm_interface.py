import os
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"

_groq_client = None

def _get_groq_client():
    global _groq_client
    if _groq_client is None and GROQ_API_KEY:
        from groq import Groq
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


class StudyBrainLLM:
    def __init__(self):
        pass

    async def _call_ollama(self, prompt: str) -> str:
        """Calls the local Ollama API."""
        try:
            payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            response = requests.post(OLLAMA_URL, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json().get("response", "")
            return None
        except Exception:
            return None

    async def _call_groq(self, prompt: str) -> str:
        """Calls Groq's free-tier API (Llama 3.1)."""
        import asyncio
        client = _get_groq_client()
        if not client:
            return None

        def _sync_call():
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are StudyBrain AI, an intelligent personal AI tutor. Answer questions using only the provided context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
            )
            return completion.choices[0].message.content

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_call)

    async def generate_answer(self, query: str, context: str, provider: str = "auto") -> dict:
        """
        Generates a grounded answer.
        provider: "auto" (Ollama → Groq), "ollama", "groq"
        """
        if not context or str(context).strip() == "":
            return {
                "answer": "I couldn't find relevant information in your study materials for that question. Try uploading more documents or rephrasing.",
                "sources": []
            }

        sources = set()
        for line in context.split('\n'):
            if line.startswith("Document: "):
                source = line.replace("Document: ", "").replace(" ---", "").strip()
                if source:
                    sources.add(source)

        prompt = (
            f"Answer the student's question using ONLY the context below. "
            f"If the answer isn't in the context, say you cannot find it in their study materials.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {query}\n\n"
            f"Answer clearly and educationally:"
        )

        answer_text = None

        # 1. Try Ollama if available
        if provider in ["auto", "ollama"]:
            answer_text = await self._call_ollama(prompt)
            if not answer_text and provider == "ollama":
                return {"answer": "Error: Local Ollama is not responding.", "sources": []}

        # 2. Try Groq (free tier)
        if not answer_text and provider in ["auto", "groq"]:
            print("Trying Groq...")
            try:
                answer_text = await self._call_groq(prompt)
            except Exception as e:
                answer_text = f"AI error: {str(e)}"

        if not answer_text:
            if not GROQ_API_KEY:
                answer_text = "No AI provider is configured. Please add your GROQ_API_KEY in the Replit Secrets panel to enable AI responses."
            else:
                answer_text = "I was unable to generate a response right now. Please try again in a moment."

        return {"answer": answer_text, "sources": list(sources)}


# Global instance
llm = StudyBrainLLM()
