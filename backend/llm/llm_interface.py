import os
from dotenv import load_dotenv
load_dotenv()

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

GROQ_MODEL = "llama-3.1-8b-instant"

_groq_client = None

def _get_groq_client():
    global _groq_client
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("DEBUG: GROQ_API_KEY not found in os.environ")
        return None
        
    if _groq_client is None:
        print(f"DEBUG: Initializing Groq client with key length {len(api_key)}")
        try:
            from groq import Groq
            _groq_client = Groq(api_key=api_key)
            print("DEBUG: Groq client object created successfully")
        except Exception as e:
            print(f"DEBUG: Groq import/init failed: {str(e)}")
            _groq_client = None
    return _groq_client


class StudyBrainLLM:
    def __init__(self):
        pass

    async def _call_ollama(self, prompt: str) -> str:
        """Calls the local Ollama API."""
        print("DEBUG: Calling Ollama...")
        try:
            payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            response = requests.post(OLLAMA_URL, json=payload, timeout=30)
            if response.status_code == 200:
                print("DEBUG: Ollama success")
                return response.json().get("response", "")
            print(f"DEBUG: Ollama failed with status {response.status_code}")
            return None
        except Exception as e:
            print(f"DEBUG: Ollama exception: {str(e)}")
            return None

    async def _call_groq(self, prompt: str, max_tokens: int = 4096) -> str:
        """Calls Groq's free-tier API (Llama 3.1)."""
        import asyncio
        print("DEBUG: Getting Groq client...")
        client = _get_groq_client()
        if not client:
            print("DEBUG: No Groq client available")
            return None

        print(f"DEBUG: Executing Groq sync call (max_tokens={max_tokens})...")
        def _sync_call():
            try:
                completion = client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": "You are StudyBrain AI, an intelligent personal AI tutor. Answer questions using only the provided context."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=max_tokens,
                )
                res = completion.choices[0].message.content
                print(f"DEBUG: Groq sync call success, length: {len(res) if res else 0}")
                return res
            except Exception as e:
                print(f"DEBUG: Groq API call failed: {str(e)}")
                raise e

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_call)

    async def generate_answer(self, query: str, context: str, provider: str = "auto", specialized_prompt: bool = False) -> dict:
        print(f"DEBUG: generate_answer called. Provider: {provider}, Context length: {len(context)}")
        """
        Generates a grounded answer.
        provider: "auto" (Ollama → Groq), "ollama", "groq"
        specialized_prompt: If True, query is used as the full prompt.
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

        if specialized_prompt:
            prompt = query
        else:
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
                # Use higher token limit for quizzes/specialized prompts
                m_tokens = 4096 if specialized_prompt else 2048
                answer_text = await self._call_groq(prompt, max_tokens=m_tokens)
            except Exception as e:
                answer_text = f"AI error: {str(e)}"

        if not answer_text:
            if not os.environ.get("GROQ_API_KEY"):
                answer_text = "No AI provider is configured. Please add your GROQ_API_KEY to the .env file to enable AI responses."
            else:
                answer_text = "I was unable to generate a response right now. Please try again in a moment."

        return {"answer": answer_text, "sources": list(sources)}


# Global instance
llm = StudyBrainLLM()
