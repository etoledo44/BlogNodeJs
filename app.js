//carregando modules
const express = require ('express')
const handlebars = require('express-handlebars') // handlebars é um motor grafico que ajuda na renderizacao de telas
const bodyParse = require('body-parser')
const admin = require('./routes/admin') // importando o admin para poder usar a rota
const path = require ('path')
const app = express() //exportando a funcao express para usar routes e outras features
const mongoose = require('mongoose')
const session = require('express-session') //package para sessoes
const flash = require('connect-flash') //package para sessoes


//config

    //sessao 
    app.use(session({
        secret: 'nodejayesse',
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg') //declaração de variavel global 
        res.locals.error_msg = req.flash('error_msg')
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
    mongoose.connect('mongodb://localhost/blogapp').then(()=>{
        console.log('Conectado ao banco')
    }).catch(err => {
        console.error(`Erro: ${err}`)
    })

    //Public
    app.use(express.static(path.join(__dirname, 'public'))) //fazer o express acessar a pasta public para ter acesso aos arq. estaticos
    
    // routes
    app.use('/admin', admin) //a rota ja pode ser acessada via url

    //others
    const PORT = 3333
    app.listen(PORT, ()=>{
        console.log(`Servidor rodando em localhost://${PORT}`)
    }) //abrindo uma porta para rodar a aplicação


