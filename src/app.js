const express = require('express')
const pool = require('./config/database')

const app = express()
app.use(express.json())

const queryAsync = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

app.get('/', (req, res) => {
    res.send("API CINEMA")
})

// LISTAR TODOS
app.get('/filmes', async (req, res) => {
    try {
        const filmes = await queryAsync('SELECT * FROM filme')
        res.json({
            sucesso: true,
            dados: filmes,
            total: filmes.length
        })
    } catch (erro) {
        console.error('Erro ao listar filmes:', erro)
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar filmes', erro: erro.message })
    }
})

// BUSCAR POR ID
app.get('/filmes/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID de filme inválido.' })
        }

        const filme = await queryAsync('SELECT * FROM filme WHERE id = ?', [id])
        if (filme.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Filme não encontrado' })
        }

        res.json({ sucesso: true, dados: filme[0] })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao encontrar filme', erro: erro.message })
    }
})

// CRIAR
app.post('/filmes', async (req, res) => {
    try {
        const { titulo, genero, duracao, classificacao, data_lancamento } = req.body
        if (!titulo || !genero || !duracao) {
            return res.status(400).json({ sucesso: false, mensagem: 'Título, gênero e duração são obrigatórios' })
        }

        const novoFilme = {
            titulo: titulo.trim(),
            genero: genero.trim(),
            duracao,
            classificacao: classificacao || null,
            data_lancamento: data_lancamento || null
        }

        const resultado = await queryAsync('INSERT INTO filme SET ?', [novoFilme])
        res.status(201).json({ sucesso: true, mensagem: 'Filme cadastrado!', id: resultado.insertId })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar filme.', erro: erro.message })
    }
})

// ATUALIZAR (PUT)
app.put('/filmes/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { titulo, genero, duracao, classificacao, data_lancamento } = req.body

        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID filme inválido' })
        }

        const filmeAtualizado = {}
        if (titulo !== undefined) filmeAtualizado.titulo = titulo.trim()
        if (genero !== undefined) filmeAtualizado.genero = genero.trim()
        if (duracao !== undefined) filmeAtualizado.duracao = duracao
        if (classificacao !== undefined) filmeAtualizado.classificacao = classificacao
        if (data_lancamento !== undefined) filmeAtualizado.data_lancamento = data_lancamento

        const resultado = await queryAsync('UPDATE filme SET ? WHERE id = ?', [filmeAtualizado, id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Filme não encontrado para atualizar' })
        }

        res.json({ sucesso: true, mensagem: 'Filme atualizado com sucesso' })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar.', erro: erro.message })
    }
})

// DELETAR
app.delete('/filmes/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID filme inválido' })
        }

        const resultado = await queryAsync('DELETE FROM filme WHERE id = ?', [id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Filme não encontrado' })
        }

        res.json({ sucesso: true, mensagem: 'Filme apagado com sucesso' })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao apagar.', erro: erro.message })
    }
})


app.get('/salas', async (req, res) => {
    try {
        const salas = await queryAsync('SELECT * FROM sala')
        res.json({
            sucesso: true,
            dados: salas,
            total: salas.length
        })
    } catch (erro) {
        console.error('Erro ao listar salas:', erro)
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar salas', erro: erro.message })
    }
})


app.get('/salas/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID da sala inválido.' })
        }

        const sala = await queryAsync('SELECT * FROM sala WHERE id = ?', [id])
        if (sala.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Sala não encontrada' })
        }

        res.json({ sucesso: true, dados: sala[0] })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao encontrar sala', erro: erro.message })
    }
})


app.post('/salas', async (req, res) => {
    try {
        const { nome, capacidade } = req.body
        if (!nome || !capacidade) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nome e capacidade são obrigatórios' })
        }

        const novaSala = {
            nome: nome.trim(),
            capacidade
        }

        const resultado = await queryAsync('INSERT INTO sala SET ?', [novaSala])
        res.status(201).json({ sucesso: true, mensagem: 'Sala cadastrada!', id: resultado.insertId })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar sala.', erro: erro.message })
    }
})


app.put('/salas/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nome, capacidade } = req.body

        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID sala inválido' })
        }

        const salaAtualizada = {}
        if (nome !== undefined) salaAtualizada.nome = nome.trim()
        if (capacidade !== undefined) salaAtualizada.capacidade = capacidade

        const resultado = await queryAsync('UPDATE sala SET ? WHERE id = ?', [salaAtualizada, id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Sala não encontrada para atualizar' })
        }

        res.json({ sucesso: true, mensagem: 'Sala atualizada com sucesso' })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar.', erro: erro.message })
    }
})


app.delete('/salas/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID sala inválido' })
        }

        const resultado = await queryAsync('DELETE FROM sala WHERE id = ?', [id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Sala não encontrada' })
        }

        res.json({ sucesso: true, mensagem: 'Sala apagada com sucesso' })
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao apagar.', erro: erro.message })
    }
})


app.get('/sessoes', async (req, res) => {
    try {
        const sessoes = await queryAsync('SELECT * FROM sessao')
        res.json({
            sucesso: true,
            dados: sessao,
            total: sessao.length
        })
    } catch (erro) {
        console.error('Erro ao listar sessões:', erro)
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar sessões', erro: erro.message })
    }
})

module.exports = app