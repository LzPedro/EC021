const restify = require('restify')
const mongoose = require('mongoose')
const axios = require('axios').default;
var corsMiddleware = require('restify-cors-middleware')
const token = {}
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
const porta = 8080

mongoose.connect('mongodb+srv://adauto:adauto@cluster0-rven8.mongodb.net/test?retryWrites=true&w=majority')
        .then(_=>{
        console.log("MONGO connected")
})
//login  
server.get('/auth/login', (req, res,next) => {
    console.log("TRYING TO LOGIN")
    const url_login = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/login'
    const url_token = 'https://ec021-2019-2-av2-auth.herokuapp.com/auth/validateToken '
    
    axios.post(url_login, { "username": 'pedro.manoel',"password": '1160' })
        .then(function(response, data) {
            data = response.data.token;
            axios({
                method: 'post', //you can set what request you want to be
                url: url_token,
                headers: {
                  Token: data
                }
              })
              .then(function(response,data){
                  //console.log(response.data.token)
                  res.send({Token:`${response.data.token}`});
              })
        });
});

const Meme = require('./meme');


//CREATE
server.post('/meme', (req, res) => {
    //res.send({mensagem:`Hello World, ${req.params.nome}`});
});

//READ_ALL
server.get('/meme', (req, res,next) => {
    Meme.find().then(memes=>{
        res.json(memes)
        return next()
    })
    //res.send({mensagem:`Hello World, ${req.params.nome}`});
});
//READ_ONE
server.get('/meme/:meme_id', (req, res,next) => {
    Meme.findById(req.params.meme_id).then(meme=>{
        if(meme){
            res.json(meme)
        }
        else{
            res.status(404)
            res.json({message: 'not found'})
        }
        return next()
    })
});





server.listen(porta, () => {
  console.log(`Servidor de pé em http://localhost:${porta}`)
  console.log('Pra derrubar o servidor: ctrl + c')
})