
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Local exato do db.json
const DB_FILE = path.join(__dirname, 'db.json');


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


// ==========================================
// LER BANCO DE DADOS
// ==========================================

function lerBancoDeDados() {

    console.log('Lendo banco:', DB_FILE);

    if (!fs.existsSync(DB_FILE)) {

        console.log('db.json não existe. Criando...');

        const bancoInicial = {
            alunos: []
        };

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(bancoInicial, null, 2)
        );

        return bancoInicial;
    }

    const data = fs.readFileSync(
        DB_FILE,
        'utf-8'
    );

    const db = JSON.parse(data);

    // Se o JSON for um array diretamente
    if (Array.isArray(db)) {

        console.log('O db.json está como array.');

        return {
            alunos: db
        };
    }

    // Se não existir "alunos"
    if (!db.alunos || !Array.isArray(db.alunos)) {

        console.log('Propriedade "alunos" não encontrada.');

        db.alunos = [];
    }

    return db;
}


// ==========================================
// SALVAR BANCO
// ==========================================

function salvarBancoDeDados(dados) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(dados, null, 2)
    );

}


// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            'public',
            'index.html'
        )
    );

});


// ==========================================
// TESTE
// ==========================================

app.get('/teste', (req, res) => {

    res.json({
        mensagem: 'Servidor funcionando!'
    });

});


// ==========================================
// CREATE - POST
// ==========================================

app.post('/api/alunos', (req, res) => {

    console.log('POST /api/alunos');
    console.log('Dados recebidos:', req.body);

    const {
        nome,
        email,
        cpf,
        telefone,
        curso
    } = req.body;

    if (
        !nome ||
        !email ||
        !cpf ||
        !telefone ||
        !curso
    ) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const db = lerBancoDeDados();

    const nextid =
        db.alunos.length > 0
            ? Math.max(
                ...db.alunos.map(
                    aluno => Number(aluno.id) || 0
                )
            ) + 1
            : 1;

    const novoAluno = {

        id: nextid,
        nome,
        email,
        cpf,
        telefone,
        curso

    };

    db.alunos.push(novoAluno);

    salvarBancoDeDados(db);

    console.log('Aluno criado:', novoAluno);

    res.status(201).json(novoAluno);

});


// ==========================================
// READ - GET
// ==========================================

app.get('/api/alunos', (req, res) => {

    console.log('GET /api/alunos');

    const db = lerBancoDeDados();

    console.log(
        'Alunos encontrados:',
        db.alunos
    );

    res.status(200).json(db.alunos);

});


// ==========================================
// UPDATE - PUT
// ==========================================

app.put('/api/alunos/:id', (req, res) => {

    const id = Number(req.params.id);

    const {
        nome,
        email,
        cpf,
        telefone,
        curso
    } = req.body;

    if (
        !nome ||
        !email ||
        !cpf ||
        !telefone ||
        !curso
    ) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const db = lerBancoDeDados();

    const index = db.alunos.findIndex(
        aluno => Number(aluno.id) === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    db.alunos[index] = {

        ...db.alunos[index],

        nome,
        email,
        cpf,
        telefone,
        curso

    };

    salvarBancoDeDados(db);

    res.status(200).json(
        db.alunos[index]
    );

});


// ==========================================
// DELETE - DELETE
// ==========================================

app.delete('/api/alunos/:id', (req, res) => {

    const id = Number(req.params.id);

    const db = lerBancoDeDados();

    const index = db.alunos.findIndex(
        aluno => Number(aluno.id) === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    db.alunos.splice(index, 1);

    salvarBancoDeDados(db);

    res.status(204).send();

});


// ==========================================
// SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log('');
    console.log('======================================');
    console.log('SERVIDOR RODANDO');
    console.log('======================================');

    console.log(
        `http://localhost:${PORT}`
    );

    console.log(
        `http://localhost:${PORT}/api/alunos`
    );

    console.log(
        `Banco: ${DB_FILE}`
    );

    console.log('======================================');
    console.log('');

});