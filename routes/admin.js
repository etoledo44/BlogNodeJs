const express = require('express')
const mongoose = require ('mongoose')
const router = express.Router()
require('../models/Categoria') //importando o model categoria para poder fazer a insercao no db
const Categoria = mongoose.model('categorias')

router.get('/', (req, res)=>{
    res.render("admin/index")

})
router.get('/posts', (req, res)=>{
    res.send ('Pagina de posts')
})
router.get('/categorias', (req, res)=>{
    res.render('admin/categorias')
})
router.get('/categorias/add', (req, res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res)=>{

    var erros = [] //criando array para armazenar os erros 
        //validação dos dados antes de inserir no db
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({ text: 'Nome inválido'})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({text: "Slug inválido"})
        }
        if(req.body.nome.length < 2 ){
            erros.push({text: 'Nome da categoria muito pequeno'})
        }
        if(erros.length > 0){
            res.render('admin/addcategorias', {erros:erros}) //mandando os erros para serem usados na hora de renderizar a tela
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(()=>{
                req.flash('success_msg', 'Categoria criada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch(err => {
                req.flash('error_msg', 'Houve um erro ao salvar a categoria!')
                res.redirect('/admin')
            })
        }
})

module.exports = router