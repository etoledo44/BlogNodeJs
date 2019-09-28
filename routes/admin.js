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
    Categoria.find().sort({date: 'desc'}).then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch(err =>{
        req.flash("error_msg", "Houve um erro ao listar categorias!")
        res.redirect('/admin')
    })
    
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

router.get('/categorias/edit/:id', (req, res)=>{
    Categoria.findOne({_id:req.params.id}).then((categorias)=>{
    res.render('admin/editCategorias', {categorias:categorias})
    }).catch(err =>{
        req.flash('error_msg', `A categoria nao existe! [${err}]`)
        res.redirect('/admin')
    })
    
})
router.post('/categorias/edit', (req, res)=>{
    Categoria.findOne({_id:req.body.id}).then((categorias)=>{
        categorias.nome = req.body.nome,
        categorias.slug = req.body.slug

        categorias.save().then(()=>{
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(err =>{
            req.flash('error_msg', `Erro ao salvar [${err}]`)
            res.redirect('/admin/categorias')
        })

    }).catch(err=>{
        req.flash('error_msg', `Erro ao editar categoria [${err}]`)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/delete', (req, res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'Categoria deletada!')
        res.redirect('/admin/categorias')
    }).catch(err =>{
        req.flash('error_msg', `Erro ao deletar categoria [${err}]`)
        res.redirect('/admin/categorias')
    })
})

module.exports = router