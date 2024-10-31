const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const db = new sqlite3.Database('./database.db');

// Configurações do middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secreto123',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Para servir imagens

// Configurações da view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar o armazenamento do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Página de Login
app.get('/login', (req, res) => {
    res.render('login');
});

// Autenticação de usuário
// Redirecionar para o dashboard após o login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (user) {
            req.session.userId = user.id;
            req.session.role = user.role;
            if (user.role === 'admin') {
                res.redirect('/admin'); // Redireciona para a página admin.ejs
            } else {
                res.redirect('/dashboard'); // Redireciona para o dashboard se não for admin
            }
        } else {
            res.send('Usuário ou senha inválidos');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Erro ao sair');
        }
        res.redirect('/login'); // Redireciona para a página de login
    });
});

// Middleware para verificar se o usuário é admin
function verificarAdmin(req, res, next) {
    if (req.session.role === 'admin') {
        return next(); // Permitir acesso ao admin
    }
    res.redirect('/dashboard'); // Redireciona para o dashboard se não for admin
}

// Rota do dashboard
app.get('/dashboard', (req, res) => {
    db.get('SELECT * FROM usuarios WHERE id = ?', [req.session.userId], (err, usuario) => {
        if (err) {
            return res.send('Erro ao carregar o usuário');
        }
        res.render('dashboard', { usuario });
    });
});

// Rota para o painel do administrador
app.get('/admin', verificarAdmin, (req, res) => {
    res.render('admin');
});

// Página de Cadastro de Usuário (somente para admin)
app.get('/cadastro', verificarAdmin, (req, res) => {
    res.render('cadastro');
});

// Cadastro de novo usuário
app.post('/cadastro', (req, res) => {
    const { username, password, role } = req.body;
    db.run('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
        if (err) {
            return res.send('Erro ao cadastrar usuário');
        }
        res.send('Usuário cadastrado com sucesso');
    });
});

// Rota para exibir o formulário de cadastro de itens
app.get('/cadastro-item', verificarAdmin, (req, res) => {
    res.render('cadastro-item');
});

// Rota para processar o cadastro de novos itens
app.post('/cadastro-item', upload.single('imagem'), (req, res) => {
    const nome = req.body.nome;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;

    // Inserir o item no banco de dados
    db.run(`
        INSERT INTO itens (nome, imagem)
        VALUES (?, ?)
    `, [nome, imagem], (err) => {
        if (err) {
            console.error("Erro ao cadastrar o item:", err.message);
            return res.send(`Erro ao cadastrar o item: ${err.message}`);
        }
        res.redirect('/itens');
    });
});

// Rota para exibir a lista de itens
app.get('/itens', (req, res) => {
    db.all('SELECT * FROM itens', (err, itens) => {
        if (err) {
            return res.send('Erro ao listar itens');
        }
        const isAdmin = req.session.role === 'admin'; // Verifica se é admin
        res.render('itens', { itens, isAdmin });
    });
});

// Rota para adicionar item ao carrinho
app.post('/adicionar-carrinho', (req, res) => {
    const { itemId, quantidade } = req.body;
    const usuarioId = req.session.userId;

    // Verifica se o item já está no carrinho
    db.get(`
        SELECT * FROM carrinho 
        WHERE usuario_id = ? AND item_id = ?
    `, [usuarioId, itemId], (err, row) => {
        if (err) {
            return res.send('Erro ao verificar o carrinho');
        }

        if (row) {
            // Se já existe, atualiza a quantidade
            db.run(`
                UPDATE carrinho 
                SET quantidade = quantidade + ? 
                WHERE usuario_id = ? AND item_id = ?
            `, [quantidade, usuarioId, itemId], (err) => {
                if (err) {
                    return res.send('Erro ao atualizar o carrinho');
                }
                res.redirect('/itens'); // Redireciona para a página de itens
            });
        } else {
            // Se não existe, insere um novo item no carrinho
            db.run(`
                INSERT INTO carrinho (usuario_id, item_id, quantidade) 
                VALUES (?, ?, ?)
            `, [usuarioId, itemId, quantidade], (err) => {
                if (err) {
                    return res.send('Erro ao adicionar ao carrinho');
                }
                res.redirect('/itens'); // Redireciona para a página de itens
            });
        }
    });
});

// Rota para exibir o carrinho
app.get('/carrinho', (req, res) => {
    const usuarioId = req.session.userId;

    db.all(`
        SELECT itens.nome, itens.valor, carrinho.quantidade
        FROM carrinho
        JOIN itens ON carrinho.item_id = itens.id
        WHERE carrinho.usuario_id = ?
    `, [usuarioId], (err, carrinho) => {
        if (err) {
            return res.send('Erro ao carregar o carrinho');
        }

        // Verifica se os itens foram retornados corretamente
        console.log('Itens no carrinho:', carrinho);

        // Calcular o total dos itens no carrinho
        let total = carrinho.reduce((acc, item) => acc + (item.valor * item.quantidade), 0);
        
        res.render('carrinho', { carrinho, total });
    });
});

// Rota para deletar um item (somente para admin)
app.post('/deletar-item/:id', verificarAdmin, (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM itens WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.send('Erro ao deletar item');
        }
        res.redirect('/itens');
    });
});

// Rota para deletar um usuário (somente para admin)
app.post('/deletar-usuario/:id', verificarAdmin, (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM usuarios WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.send('Erro ao deletar usuário');
        }
        res.redirect('/usuarios'); // Redireciona para a página de usuários após a exclusão
    });
});

// Rota de acesso negado
app.get('/acesso-negado', (req, res) => {
    res.send('Acesso negado');
});

// Iniciando o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
