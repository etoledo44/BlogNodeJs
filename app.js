//carregando modules
const express = require ('express')
const handlebars = require('express-handlebars') // handlebars é um motor grafico que ajuda na renderizacao de telas
const bodyParse = require('body-parser')
const admin = require('./routes/admin') // importando o admin para poder usar a rota
const categorias = require('./routes/categorias')
const usuario = require('./routes/usuario')
const registrar = require('./routes/resgistrar')
const path = require ('path')
const app = express() //exportando a funcao express para usar routes e outras features
const mongoose = require('mongoose')
const session = require('express-session') //package para sessoes
const flash = require('connect-flash') //package para sessoes
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const passport = require('passport')
require('./config/auth') (passport)
const db = require('./config/db') //requisitando o modo de conexao 



//config

    //sessao 
    app.use(session({
        secret: 'nodejayesse',
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    
    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg') //declaração de variavel global 
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;
        next() //permite a req ou res avançar 
    })

    //body-parser
    app.use(bodyParse.urlencoded({extended:true}))
    app.use(bodyParse.json())

    //handlebars, configurando o motor que vai gerar a parte grafica
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    
    //mongoose, conxexao com o banco de dados 
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(()=>{ //mongodb://localhost/blogapp -> para conexao local
        console.log('Conectado ao banco')
    }).catch(err => {
        console.error(`Erro: ${err}`)
    })

    //Public
    app.use(express.static(path.join(__dirname, 'public'))) //fazer o express acessar a pasta public para ter acesso aos arq. estaticos
    
    // routes
    app.get('/', (req, res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render('index', {postagens: postagens})

        }).catch(err =>{
            req.flash(`error_msg', 'Erro ao carregar postagens [${err}]`)
            res.redirect('/404')
        })

        
    })

    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).then((postagens)=>{
            if(postagens){
                res.render('postagens/index', {postagens: postagens})

            }else{
                req.flash('error_msg', `Não existe essa postagem!`)
                res.redirect('/')

            }
        }).catch(err=>{
            req.flash('error_msg', `A postagem não existe [${err}]`)
        })

    })

    app.get('/404', (req, res)=>{
        res.render('erro')
    })

    app.use('/usuario', usuario)
    app.use('/categoria', categorias)

    app.use('/admin', admin) //a rota ja pode ser acessada via url

    //others
    const PORT =process.env.PORT || 3000 //o heroku usa porta aleatoria, por isso usar o process.env.PORT do node
    app.listen(PORT, ()=>{
        console.log(`Servidor rodando em localhost://${PORT}`)
    }) //abrindo uma porta para rodar a aplicação


