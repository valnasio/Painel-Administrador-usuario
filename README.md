# Projeto App de doações 

## Este projeto é uma aplicação de painel de administração simples, onde usuários podem se cadastrar, visualizar itens e acessar funcionalidades de um painel de controle. 
## Abaixo estão todas as informações necessárias sobre as tecnologias utilizadas,astificativa para cada uma e os passos detalhados para configuração e execução do projeto.

# Tecnologias Utilizadas

Node.js: Ambiente de execução de JavaScript no lado do servidor, permitindo criar aplicações rápidas e escaláveis.
Express: Framework para configurar o servidor e gerenciar rotas de maneira simples e eficiente.
EJS (Embedded JavaScript Templates): Usado para renderizar HTML com dados dinâmicos, facilitando a integração de variáveis JavaScript nas views e simplificando a lógica de front-end.
SQLite3: Banco de dados leve, ideal para aplicações locais pequenas, sem necessidade de configuração de servidor.
CSS: Incluído para estilizar a interface, proporcionando uma experiência visual agradável e moderna.
Configuração do Ambiente e Instalação das Dependências
Passo a Passo:
Certifique-se de que o Node.js e npm estão instalados. Para verificar e instalar, execute os comandos a seguir:

```
node -v
npm -v
```
Caso não estejam instalados, baixe e instale o Node.js a partir do site oficial.

Clone o repositório do projeto:

```
git clone https://github.com/seu-usuario/https://github.com/valnasio/Painel-Administrador-usuario.git
cd seu-repositorio
```
Instale as dependências do projeto:

```
npm install
```
Instale o SQLite3:

```
npm install sqlite3
```
Configure o banco de dados SQLite3. No terminal, execute os seguintes comandos:

```
sqlite3 database.db
CREATE TABLE usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);
CREATE TABLE itens (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT);
.exit
```
Configure o servidor para apontar corretamente para o database.db no código-fonte.

Inicie o servidor:

```
node app.js
```
Abra o navegador e acesse http://localhost:3000 para interagir com o painel do administrador.
