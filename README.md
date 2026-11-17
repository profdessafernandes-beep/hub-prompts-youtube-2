# ✨ Hub de Prompts

Um lugar para guardar, organizar e copiar seus prompts de IA. Funciona direto no navegador, sem servidor e sem instalar nada.

## Funções

- Login com usuário e senha
- Prompts com título, categoria e tags
- Busca (atalho `/`), favoritos ⭐ e ordenação
- Variáveis `{{assim}}`, preenchidas na hora de copiar
- Copiar com um clique, duplicar, editar e excluir
- Exportar e importar backup em `.json`

## Arquivos

```
index.html      → tela de login (página inicial)
prompts.html    → o hub
css/style.css   → visual do hub
css/login.css   → visual do login
js/auth.js      → lógica de login
js/login.js     → tela de login
js/app.js       → lógica do hub
.nojekyll       → avisa o GitHub Pages para publicar os arquivos como estão
```

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `hub-de-prompts`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório.
   Pelo site: *Add file → Upload files*, arraste os arquivos e as pastas `css` e `js`, depois *Commit changes*.
3. No repositório, vá em **Settings → Pages**.
4. Em *Source*, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e clique em *Save*.
5. Em 1 ou 2 minutos o site estará em `https://SEU-USUARIO.github.io/hub-de-prompts/`.

## ⚠️ Importante sobre o login e os dados

- **Os prompts ficam salvos no navegador** (localStorage), não no GitHub. Cada navegador ou aparelho tem a sua própria lista. Use **Exportar backup** para levar os prompts para outro aparelho ou guardar uma cópia.
- **O login é local.** No primeiro acesso de cada navegador você cria usuário e senha. A senha não fica salva: só um hash criptografado (PBKDF2), e só naquele navegador.
- O login impede que alguém que pegue seu computador ou celular abra o hub sem senha. **Não é** uma proteção de servidor: o código do site é público no GitHub, então não coloque nele (nem nos prompts de exemplo em `js/app.js`) nada secreto.
- **Esqueci a senha:** como a senha só existe naquele navegador, não dá para recuperar. A opção "Esqueci a senha" apaga a conta e os prompts daquele navegador. Depois você cria uma conta nova e importa um backup.
