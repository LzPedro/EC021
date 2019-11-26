const restify = require('restify')
const mongoose = require('mongoose')
const axios = require('axios').default;

var corsMiddleware = require('restify-cors-middleware')
var cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

const server = restify.createServer({
    name:'API',
    version:'0.0.1'
})
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser())
const porta = 8080

let token = ""
const url_login = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/login'
const url_token = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/validateToken '
const url_mongo = 'mongodb+srv://adauto:adauto@cluster0-rven8.mongodb.net/test?retryWrites=true&w=majority'
const Meme = require('./meme');

mongoose.connect(url_mongo,{useNewUrlParser: true,useUnifiedTopology: true })
        .then(_=>{
        console.log("Connected to MongoDB")
})
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//LOGIN  
server.post('/auth/login', async (req, res,next) => {
    let user = req.body.username; 
    let pass = req.body.password; 
    token = await axios.post(url_login, { "username": user,"password": pass })
    token = token.data.token
    res.send({Token:`${token}`});
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
        Meme.find().then(memes=>{
            res.status(200)
            res.json(memes)
            return next()
        })
    }
});

//READ_ONE
server.get('/meme/:meme_id([0-9a-fA-F]{24})', (req, res,next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        Meme.findById(req.params.meme_id).then(meme=>{
            if(meme){
                res.status(200)
                res.json(meme)
            }
            else{
                res.status(404)
                res.json({message: 'not found'})
            }
            return next()
        })
    }
});

//UPDATE
server.patch('/meme/:meme_id([0-9a-fA-F]{24})', async (req, res, next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        try {
            let id = req.params.meme_id; //Recebendo o valor do id da URL
            let result = await Meme.findByIdAndUpdate(id, req.body).lean(); //Buscando pessoa por id e atualizando seus dados
            if (result != null) { //Caso o resultado não seja nulo, quer dizer que encontramos um registro para atulizar e ele foi atualizado
                let memezada = await Meme.findById(id); //Buscamos o registro atualizado
                res.status(200)
                res.json({memezada: memezada})
            } else {
                res.status(404) 
                res.json({result: 'Not Found'})
            }
        } catch (error) {
            res.status(400)
            res.json({message: error})
        }
    }
});

//DELETE
server.del('/meme', async (req, res, next) => {
    if(!token){
        res.status(403)
        res.json({Erro: "Token Não Fornecido"})
    }
    else{
        try {
            let id = req.body.id; //Recebendo o valor do id da URL]
            console.log(id)
            let result = await Meme.findByIdAndDelete(id);
            if (result != null) { //Caso o resultado não seja nulo, quer dizer que encontramos um registro para excluir e ele foi excluido
                res.status(204)
                res.json({message: "Excluido"})
            } else {
                res.status(404) 
                res.json({result: 'Not Found'})
            }
        } catch (error) {
            res.status(400)
            res.json({message: error})
        }
    }
});


server.listen(porta, () => {
  console.log(`Server up at http://localhost:${porta}`)
})