"""Configurable LLM factory — selects Claude or Gemini behind one interface.

Both providers are exposed through LangChain chat models, so the agents stay
provider-agnostic and can use ``.with_structured_output(PydanticModel)`` to get
typed results regardless of which backend is configured (LLM_PROVIDER env var).
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, TypeVar

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from .config import get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


@lru_cache
def get_llm() -> BaseChatModel:
    """Build the chat model for the configured provider.

    Returns a cached instance (model config is immutable for the process).
    Raises ValueError if the selected provider has no API key configured.
    """
    settings = get_settings()

    if settings.llm_provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError(
                "LLM_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set."
            )
        from langchain_anthropic import ChatAnthropic

        logger.info("Using Anthropic model %s", settings.anthropic_model)
        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,
            max_tokens=settings.llm_max_tokens,
            timeout=120,
        )

    if settings.llm_provider == "google":
        if not settings.google_api_key:
            raise ValueError(
                "LLM_PROVIDER=google but GOOGLE_API_KEY is not set."
            )
        from langchain_google_genai import ChatGoogleGenerativeAI

        logger.info("Using Google model %s", settings.google_model)
        return ChatGoogleGenerativeAI(
            model=settings.google_model,
            google_api_key=settings.google_api_key,
            max_output_tokens=settings.llm_max_tokens,
        )

    raise ValueError(f"Unknown LLM_PROVIDER: {settings.llm_provider!r}")


def invoke_structured(
    schema: type[T], prompt: ChatPromptTemplate, variables: dict[str, Any]
) -> tuple[T, int]:
    """Run ``prompt`` through the configured model and return (typed result, tokens used).

    Uses ``include_raw=True`` so the raw message stays reachable for token accounting;
    providers that report no usage metadata yield 0.
    """
    chain = prompt | get_llm().with_structured_output(schema, include_raw=True)
    out = chain.invoke(variables)

    parsed = out["parsed"]
    if parsed is None:
        raise ValueError(
            f"Model returned no valid {schema.__name__}: {out.get('parsing_error')}"
        )

    usage = getattr(out["raw"], "usage_metadata", None) or {}
    return parsed, usage.get("total_tokens", 0)
