## Knowledge

aiFeatures.js에 AI와 관련된 내용들이 포함되어 있다

AI 모델별로 구분이 되어 있다.

## 모델별 참조 URL
- chatGPT : https://api.openai.com/v1/chat/completions
- llama : http://127.0.0.1:11434/api/chat


## OPENAI_API_KEY 사용

aiFeatures.js : 278 line 
```javascript
            completion = await axiosPostWrap('https://api.openai.com/v1/chat/completions', { ...parameters, model: OPENAI_MODEL, messages }, {
                headers: { 'Authorization': `Bearer ${await getVarVal('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' }
            });
```

## Env 설정

configuration.js : 232 line
```javascript
    const regChecker = {
        UPDATE_CHECK: typeone,
        USE_LLM: typeone,
        USE_REVIEW: typeone,
        GOOGLE_API_KEY: typeone,
        OPENAI_API_KEY: typeone,
        GROQ_API_KEY: typeone,
        ANTHROPIC_API_KEY: typeone,
        ANTHROPIC_MODEL: typeone,
        OLLAMA_PROXY_SERVER: typeone,
        OLLAMA_MODEL: typeone,
        OPENAI_MODEL: typeone,
        GROQ_MODEL: typeone,
        PYTHON_VENV_PATH: typespace,
    };
```
