const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// Excluir a tabela de usuários se existir (para garantir que a tabela tenha a estrutura correta)
db.serialize(() => {
    // Excluir a tabela usuarios se existir (isso vai apagar todos os dados da tabela)
    db.run(`DROP TABLE IF EXISTS usuarios`, (err) => {
        if (err) {
            console.error("Erro ao excluir a tabela usuarios:", err.message);
        }
    });

    // Criar tabela de usuários com o campo telefone
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
            telefone TEXT DEFAULT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Erro ao criar a tabela:", err.message);
        } else {
            console.log("Tabela 'usuarios' criada com sucesso.");
        }
    });

    // Inserir usuário padrão 'admin' se não existir
    db.run(`
        INSERT OR IGNORE INTO usuarios (username, password, role, telefone)
        VALUES ('admin', 'admin', 'admin', '1234567890')
    `, (err) => {
        if (err) {
            console.error("Erro ao inserir usuário padrão:", err.message);
        } else {
            console.log("Usuário 'admin' inserido com sucesso.");
        }
    });
});

// Criar tabela de itens com coluna de imagem
db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS itens`); // Excluir itens para garantir estrutura correta
    db.run(`
        CREATE TABLE IF NOT EXISTS itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL DEFAULT 0,
            valor REAL DEFAULT NULL,
            imagem TEXT DEFAULT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Erro ao criar a tabela de itens:", err.message);
        } else {
            console.log("Tabela 'itens' criada com sucesso.");
        }
    });
});

db.close();
