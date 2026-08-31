import os
from dotenv import load_dotenv
load_dotenv()

CANDIDATE_GROQ_MODELS = [
    os.environ.get("GROQ_MODEL"),
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile"
]
CANDIDATE_GROQ_MODELS = [m for m in CANDIDATE_GROQ_MODELS if m]
GROQ_MODEL = CANDIDATE_GROQ_MODELS[0]

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

    async def _call_groq(self, prompt: str, max_tokens: int = 4096) -> str:
        """Calls Groq's ultra-fast API with candidate model fallbacks."""
        import asyncio
        print("DEBUG: Getting Groq client...")
        client = _get_groq_client()
        if not client:
            print("DEBUG: No Groq client available")
            return None

        def _sync_call():
            last_err = None
            for model_name in CANDIDATE_GROQ_MODELS:
                try:
                    print(f"DEBUG: Trying Groq model '{model_name}' (max_tokens={max_tokens})...")
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": "You are StudyBrain AI, an intelligent personal AI tutor. Answer questions clearly and educationally using only the provided context."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=max_tokens,
                    )
                    res = completion.choices[0].message.content
                    print(f"DEBUG: Groq model '{model_name}' success, length: {len(res) if res else 0}")
                    return res
                except Exception as e:
                    print(f"DEBUG: Groq model '{model_name}' failed: {str(e)}")
                    last_err = e
                    continue
            if last_err:
                raise last_err
            return None

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_call)

    async def generate_answer(self, query: str, context: str, provider: str = "groq", specialized_prompt: bool = False) -> dict:
        print(f"DEBUG: generate_answer called. Provider: Groq, Context length: {len(context)}")
        """
        Generates a grounded answer using Groq API.
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

        try:
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


llm = StudyBrainLLM()

