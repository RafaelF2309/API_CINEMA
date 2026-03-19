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

module.exports = app