const restify = require('restify')
const mongoose = require('mongoose')
const axios = require('axios').default;


const server = restify.createServer({
    name:'API',
    version:'0.0.1'
})

server.use(restify.plugins.bodyParser())
server.pre(restify.pre.sanitizePath());

const porta = 8080

let token = ""
const url_login = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/login'
const url_token = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/validateToken '
const url_mongo = 'mongodb+srv://adauto:adauto@cluster0-rven8.mongodb.net/test?retryWrites=true&w=majority'
const Meme = require('./meme'); //Schema definido em meme.js

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(url_mongo)// faz a conexão com o banco de dados
        .then(_=>{
        console.log("Connected to MongoDB")
})

//LOGIN  
server.post('/auth/login', async (req, res,next) => {
    let user = req.body.username; 
    let pass = req.body.password; 
    try{
        token = await axios.post(url_login, { "username": user,"password": pass })
        res.send(token.data);
        token = token.data.token //salva o token obtido na variável token para uso futuro
    }catch (error){
        res.json({message: "Invalid Username or Password"})
    }
    
});

//CREATE
server.post('/meme', (req, res, next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        axios({
            method: 'post', 
            url: url_token,
            headers: {
                Token: token
            }
            }).then(function(response,data){
                let memezada = new Meme(req.body)
                memezada.save().then(memezada=>{
                    console.log(response.data.token)
                    res.status(201)
                    res.json(memezada)
                }).catch(error=>{
                    res.status(400)
                    res.json({message: error.message})
                })
            })
        .catch(error => {
                res.status(401)
                res.json({Erro: "Token Inválido"})        
        });
    }
});

//READ_ALL
server.get('/meme', (req, res,next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        axios({
            method: 'post', 
            url: url_token,
            headers: {
                Token: token
            }
            }).then(function(response,data){
                Meme.find().then(memes=>{
                    console.log(response.data.token)
                    res.status(200)
                    res.json(memes)
                    return next()
                })
            })
        .catch(error => {
                res.status(401)
                res.json({Erro: "Token Inválido"})        
        });
    }
});

//READ_ONE
server.get('/meme/:meme_id([0-9a-fA-F]{24})', (req, res,next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        axios({
            method: 'post', 
            url: url_token,
            headers: {
                Token: token
            }
            }).then(function(response,data){
                Meme.findById(req.params.meme_id).then(meme=>{
                    if(meme){//Caso o resultado não seja nulo, quer dizer que encontramos um registro para mostrar
                        console.log(response.data.token)
                        res.status(200)
                        res.json(meme)
                    }
                    else{//Caso contrário, quer dizer que não encontramos um registro
                        res.status(404)
                        res.json({message: 'not found'})
                    }
                    return next()
                })
            })
        .catch(error => {
                res.status(401)
                res.json({Erro: "Token Inválido"})        
        });
    }
});

//UPDATE
server.patch('/meme/:meme_id([0-9a-fA-F]{24})', async (req, res, next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        axios({
            method: 'post', 
            url: url_token,
            headers: {
                Token: token
            }
            }).then(async function(response,data){
                try {
                    let id = req.params.meme_id; //Recebendo o valor do id da URL
                    let result = await Meme.findByIdAndUpdate(id, req.body).lean(); //Buscando pessoa por id e atualizando seus dados
                    if (result != null) { //Caso o resultado não seja nulo, quer dizer que encontramos um registro para atulizar e ele foi atualizado
                        let memezada = await Meme.findById(id); //Buscamos o registro atualizado
                        res.status(200)
                        res.json({message: "Meme updated"})
                    } else {//Caso contrário, quer dizer que não encontramos um registro
                        res.status(404) 
                        res.json({message: 'Not Found'})
                    }
                } catch (error) {
                    res.status(400)
                    res.json({message: error})
                }
            })
        .catch(error => {
                res.status(401)
                res.json({Erro: "Token Inválido"})        
        });
    }
});

//DELETE
server.del('/meme', async (req, res, next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        axios({
            method: 'post', 
            url: url_token,
            headers: {
                Token: token
            }
            }).then(async function(response,data){
                try {
                    let id = req.body.id; //Recebendo o valor do id da URL]
                    console.log(id)
                    let result = await Meme.findByIdAndDelete(id);
                    if (result != null) { //Caso o resultado não seja nulo, quer dizer que encontramos um registro para excluir e ele foi excluido
                        res.status(204)
                        res.json({message: "Excluido"})
                    } else {//Caso contrário, quer dizer que não encontramos um registro
                        res.status(404) 
                        res.json({result: 'Not Found'})
                    }
                } catch (error) {
                    res.status(400)
                    res.json({message: error})
                }
            })
        .catch(error => {
                res.status(401)
                res.json({Erro: "Token Inválido"})        
        });
    }
});

server.listen(porta, () => {
  console.log(`Server up at http://localhost:${porta}`)
})