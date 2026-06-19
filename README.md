# PokeBattle

Bem-vindo ao **PokeBattle**, um aplicativo móvel desenvolvido com **Expo** e **React Native** para simulação de batalhas Pokémon baseadas em atributos e colecionamento.

---

## 🔑 Credenciais de Teste

Para realizar o login na aplicação, utilize as seguintes credenciais de teste padrão:

* **Treinador (Usuário)**: `Vivi`
* **Senha**: `ViniVictor2026`

---

## 🏛️ Padrão de Layout & Arquitetura Refatorada

O projeto foi inteiramente refatorado seguindo as melhores práticas de **Clean Code**, separando a lógica de negócios da camada de apresentação (JSX) e centralizando constantes e hooks compartilhados.

### 📁 Estrutura de Diretórios Refatorada

```text
src/
├── @types/          # Tipagens globais do TypeScript (ex: pokemon.ts)
├── app/             # Rotas do Expo Router ((auth) e (app))
├── components/      # Componentes visuais atômicos e de layout reutilizáveis
├── constants/       # Tokens de design, cores e constantes de Pokémon
├── context/         # Provedores de Contexto (Autenticação e Equipe)
├── hooks/           # Custom Hooks para compartilhamento de estados complexos
└── integration/     # Integração com APIs externas (PokeAPI)
```

### 🧱 Componentes Extraídos (`src/components/`)

Cada componente possui sua própria pasta contendo o arquivo `index.tsx` (estrutura e lógica) e `style.ts` (estilização isolada):

* **`auth-layout` (`AuthLayout`)**: Abstração visual de formulários de autenticação. Controla o comportamento de teclado (`KeyboardAvoidingView`), rolagem (`ScrollView`), orbes decorativas embaçadas no topo/fundo para Web e o logotipo superior do aplicativo.
* **`alert-banner` (`AlertBanner`)**: Exibe banners de erros ou alertas de validação de forma unificada nas telas de autenticação utilizando a paleta de cores semântica do tema.
* **`score-board` (`ScoreBoard`)**: Exibe as pontuações e o indicador central de confronto da Arena.
* **`battle-log-box` (`BattleLogBox`)**: Caixa verde estilo terminal retro dedicada aos logs detalhados do combate na Arena.
* **`pokemon-stage` (`PokemonStage`)**: Apresenta a estrutura de batalha de um Pokémon ativo (imagem de artwork, nome, badge de vitória e tabela de status formatada).
* **`pokemon-detail-modal` (`PokemonDetailModal`)**: Gerencia o detalhamento de status de um Pokémon selecionado no time, controlando localmente fluxos de substituição e troca rápida.

### 🎣 Hooks Customizados (`src/hooks/`)
* **`useShinyList`**: Encapsula a sincronização e leitura em disco local (`AsyncStorage`) dos IDs de Pokémons Shiny adquiridos pelo treinador, evitando leituras de armazenamento redundantes.

### ⚙️ Constantes e Utilitários (`src/constants/pokemon.ts`)
* Concentra as constantes compartilhadas `STATS_POOL` e `STAT_LABELS`.
* Exporta a função utilitária `getStatValue` para padronizar e mapear as chaves de atributos vindos da API nos componentes visuais.

---

## ⚔️ Regras de Combate e Ajustes de Batalha

A Arena de Batalha funciona sob as seguintes regras:

1. **Empate de Rodada**: Em caso de empate de atributos em uma rodada da batalha, **nenhum ponto é concedido a ninguém** (o placar permanece inalterado). O log de combate detalha o empate e seus respectivos valores.
2. **Definição de Vencedor por Pontos**: Se a partida de 5 rounds acabar e nenhum jogador atingir a pontuação limite de 3 vitórias, o vencedor é decidido por quem tiver acumulado **mais pontos ao final das 5 rodadas** (ex: 2-1 ou 1-0).
3. **Empate Final**: Caso ambos encerrem a partida empatados (ex: 2-2, 1-1, 0-0), a partida finaliza indicando **`🤝 EMPATE!`** com o placar correspondente. Nenhuma vitória ou derrota é incrementada no perfil do usuário, e não há distribuição de Pokémon de recompensa.
4. **Padronização de Imagens**: O sprite de batalha do Pokémon do jogador utiliza a mesma URL de alta resolução (artwork oficial da PokeAPI) utilizada pelo oponente, gerando consistência visual de tamanho e renderização artística na Arena.
