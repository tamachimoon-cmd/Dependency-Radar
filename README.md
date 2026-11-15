# Dependency Radar

Ferramenta web open source do **LAB//ABERTO** para analisar estaticamente as dependências declaradas em arquivos `package.json`.

## Funcionalidades
- Colar ou carregar um `package.json` (até 2 MB).
- Inventário de `dependencies`, `devDependencies`, `peerDependencies` e `optionalDependencies`.
- Classificação de versões fixas, faixas semver, intervalos e origens externas/locais.
- Filtros por nome e grupo, métricas e exportação CSV.
- Interface em português, sem bibliotecas externas.
- Sem upload para terceiros ou telemetria. O navegador envia o conteúdo apenas ao servidor local da aplicação para análise.

**Limitações:** não consulta npm, não detecta vulnerabilidades, não verifica versões instaladas e não determina as licenças de dependências. A licença exibida é somente a do manifesto principal. Não utilize como scanner de segurança.

## Requisitos
Node.js 20+.

## Execução
```bash
npm start
```
Abra http://localhost:3000.

## Testes
```bash
npm test
npm run check
```

## Docker
```bash
docker build -t dependency-radar .
docker run --rm -p 3000:3000 dependency-radar
```
Ou `docker compose up --build`.

## API
`POST /api/analyze`: corpo JSON igual ao conteúdo de `package.json`, retorna inventário e métricas. `GET /health`: status.

## Privacidade e segurança
Execute preferencialmente localmente. O servidor não grava manifestos nem faz consultas externas. Não cole segredos no manifesto. Limites de 2 MB e 5.000 dependências.

## Documentação
Veja [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) e [ROADMAP.md](ROADMAP.md).

## Licença
MIT, veja [LICENSE](LICENSE).
