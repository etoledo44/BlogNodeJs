const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
require('../models/Categoria')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')

router.get('/', (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categoria/index', {categorias: categorias})


    }).catch(err =>{
        req.flash('error_msg', `Erro ao listar categorias [${err}]`)
        res.redirect('/')
    })
})

router.get('/:slug', (req, res)=>{
    Categoria.findOne({slug: req.params.slug}).then((categoria)=>{ 
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens)=>{
                res.render('categoria/postagens', {postagens: postagens, categorias: categoria})
            }).catch(err =>{
                req.flash( 'error_msg', `Erro ao listar posts [${err}]`)
                res.redirect('/')
            })
        }else{
            req.flash('error_msg', 'Categoria não existe')
            res.redirect('/')

        }

    }).catch(err =>{
        req.flash('error_msg', `Erro ao carregar postagens [${err}]`)
        res.redirect('/')
    })
})

module.exports = router