//Paciência e uma boa prova. Que a Força esteja com você!
import { v4 as uuidv4 } from 'uuid'; //Se não souber, não precisa usar.
import fs from 'node:fs';
import { createServer } from 'node:http';

const PORT = 3333;

const lerDadosLivraria = (callback) => {
    fs.readFile("library.json", "utf-8", (err, data) => {
        if(err){
            callback(err)
        }
        try {
            const livros = JSON.parse(data)
            callback(null, livros)
        } catch (error) {
            callback(error)
        }
    })
}


const server = createServer((request, response) => {

    const {method, url} = request

    if(method === 'GET' && url === '/editoras'){
        lerDadosLivraria((err, livros) => {
            if(err) {
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                return
            }
            const livrosEditoras = livros.map((livro) => livro.editora).filter((livro) => livro != null)
            if(livrosEditoras.length == 0){
                response.writeHead(404, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Editoras não encontradas'}))
                return
            }
            response.writeHead(200, {'Content-Type':'application/json'})
            response.end(JSON.stringify(livrosEditoras))
        })
    }else if(method === 'POST' && url.startsWith('/editoras/')){
        const id = url.split('/')[2]
        let body = ''

        request.on('data', (chunck) => {
            body += chunck
        })

        request.on('end', () => {
            const novaEditora = JSON.parse(body)
            lerDadosLivraria((err, livros) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }
                
                const livroEditora = livros.find((livro) => livro.id_livro == id)
                if(livroEditora.editora != null){
                    response.writeHead(401, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Livro já possui editora'}))
                    return
                }
                livroEditora.editora = novaEditora

               fs.writeFile("library.json", JSON.stringify(livros, null, 2), (err) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }
                response.writeHead(201, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Editora Criada!'}))
            })
            })
        })
    }else if(method === 'POST' && url.startsWith('/autores/')){
        const id = url.split('/')[2]
        let body = ''

        request.on('data', (chunck) => {
            body += chunck
        })

        request.on('end', () => {
            const novoAutor = JSON.parse(body)
            lerDadosLivraria((err, livros) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }
                
               const livroAutor = livros.find((livro) => livro.id_livro == id)
               if(livroAutor.autor != null){
                response.writeHead(401, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Livro já possui autor'}))
                return
            }
               livroAutor.autor = novoAutor

               fs.writeFile("library.json", JSON.stringify(livros, null, 2), (err) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }
                response.writeHead(201, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Autor Criado!'}))
            })
            })
        })
    }else if(method === 'POST' && url === '/livros'){
        let body = ''

        request.on('data', (chunck) => {
            body += chunck
        })

        request.on('end', () => {
            const novoLivro = JSON.parse(body)
            lerDadosLivraria((err, livros) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }
                novoLivro.id_livro = uuidv4()
                livros.push(novoLivro)
                fs.writeFile("library.json", JSON.stringify(livros, null, 2), (err) => {
                    if(err) {
                        response.writeHead(500, {'Content-Type':'application/json'})
                        response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                        return
                    }
                    response.writeHead(201, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Livro Criado!'}))
                })
            })
        })
    }else if(method === 'PUT' && url.startsWith('/editoras/')){
        const id = url.split('/')[2]
        let body = ''

        request.on('data', (chunck) => {
            body += chunck
        })

        request.on('end', () => {
            const atualizarEditora = JSON.parse(body)
            lerDadosLivraria((err, livros) => {
                if(err) {
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                    return
                }

                const indexEditora = livros.findIndex((livro) => livro.id_livro == id)
                if(indexEditora == -1){
                    response.writeHead(404, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Livro não encontrado'}))
                    return
                }
                livros[indexEditora].editora = {...livros[indexEditora].editora, ...atualizarEditora}

                fs.writeFile("library.json", JSON.stringify(livros, null, 2), (err) => {
                    if(err) {
                        response.writeHead(500, {'Content-Type':'application/json'})
                        response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                        return
                    }
                    response.writeHead(201, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message : 'Editora Atualizada!'}))
                })
            })
        })

    }else if(method === 'DELETE' && url.startsWith('/autores/') ){
        const id = url.split('/')[2]

        lerDadosLivraria((err, livros) => {
            if(err) {
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                return
            }
            const livroAutor = livros.find((livro) => livro.id_livro == id)
            console.log(livroAutor)
        })
    }else if(method === 'GET' && url.startsWith('/livros/') ){
        const id = url.split('/')[2]

        lerDadosLivraria((err, livros) => {
            if(err) {
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Erro interno do servidor'}))
                return
            }

            const acharLivro = livros.find((livro) => livro.id_livro == id)
            if(!acharLivro){
                response.writeHead(404, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message : 'Livro não encontrado'}))
                return
            }
            response.writeHead(201, {'Content-Type':'application/json'})
            response.end(JSON.stringify(acharLivro))
        })
    }else {
            response.writeHead(404, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message : 'Rota não encontrada!'}))
            return
    }
})

server.listen(PORT, () => {
    console.log(`Servidor on PORT ${PORT}`)
})