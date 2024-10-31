const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// Criar tabela de usuários e inserir o usuário padrão "admin"
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user'
        )
    `, (err) => {
        if (err) {
            console.error("Erro ao criar a tabela:", err.message);
        } else {
            console.log("Tabela 'usuarios' criada com sucesso.");
        }
    });

    // Inserir usuário padrão 'admin'
    db.run(`
        INSERT OR IGNORE INTO usuarios (username, password, role)
        VALUES ('admin', 'admin', 'admin')
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
    db.run(`DROP TABLE IF EXISTS itens`); // Adicione esta linha para garantir que a tabela seja excluída
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
