# Pokédex da Mata — projeto da professora Mayara

Um projeto só no Vercel, com uma pasta por grupo.

```
pokedex-prof-mayara/
├── index.html          ← painel com todos os grupos (página inicial)
├── vercel.json         ← avisa o Vercel para levar as missões junto com o back-end
├── api/
│   └── identificar.js  ← o back-end (igual para todos, não mexa)
├── comum/
│   └── ficha.js        ← a ficha de resultado padrão (nome, curiosidades,
│                          mapa dos biomas e habitat), usada por todos os grupos
└── grupos/
    └── meduneckas-t1-tarde-thamires/
        ├── index.html  ← o front do grupo
        └── missoes.js  ← as 6 missões do grupo
```

## Publicar (primeira vez)

1. **GitHub:** crie um repositório novo (ex.: `pokedex-prof-mayara`) →
   "uploading an existing file" → arraste **o conteúdo** desta pasta
   (`index.html`, `vercel.json`, `api`, `grupos`) → **Commit changes**.
2. **Vercel:** Add New → Project → Import do repositório → Framework
   **Other** → antes de clicar em Deploy, abra **Environment Variables**:
   - Name: `GEMINI_API_KEY`
   - Value: as chaves separadas por vírgula (`chave1,chave2,chave3`)
3. **Deploy.**

## Conferir

- `https://SEU-PROJETO.vercel.app/` → o painel. Cada grupo aparece como
  ✅ pronto ou ⚠️ com o que falta arrumar.
- `https://SEU-PROJETO.vercel.app/grupos/meduneckas-t1-tarde-thamires/` → a
  Pokédex do grupo.

## Grande teste (na Pokédex do grupo → Reconhecimento)

| Teste | Tem que aparecer |
|---|---|
| Foto de uma flor | a ficha + "🌹 Encontrei! Essa linda flor é ...! 🌸" |
| Foto de outra coisa | "🌼 Hmm... Estou com X% de certeza..." |
| Arquivo que não é foto | "🌸 Ops! Isso não parece ser uma foto de uma flor!" |

> No computador, para escolher um arquivo que não é foto: em "Escolher da
> galeria", troque o filtro da janela para **"Todos os arquivos"**.

## Grupo novo

Crie a pasta `grupos/<escola>-<turma>-<lider>/` com o `index.html` do grupo e o
`missoes.js` preenchido. Suba no GitHub; o Vercel publica sozinho e o grupo
aparece no painel.
