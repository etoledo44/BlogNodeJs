const express = require('express')
const mongoose = require ('mongoose')
const router = express.Router()
require('../models/Categoria') //importando o model categoria para poder fazer a insercao no db
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res)=>{
    res.render("admin/index")

})
router.get('/posts', eAdmin, (req, res)=>{
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
router.get('/categorias/add', eAdmin, (req, res)=>{
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

router.get('/categorias/edit/:id', eAdmin, (req, res)=>{
    Categoria.findOne({_id:req.params.id}).then((categorias)=>{
    res.render('admin/editCategorias', {categorias:categorias})
    }).catch(err =>{
        req.flash('error_msg', `A categoria nao existe! [${err}]`)
        res.redirect('/admin')
    })
    
})
router.post('/categorias/edit', eAdmin, (req, res)=>{
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

router.post('/categorias/delete', eAdmin, (req, res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'Categoria deletada!')
        res.redirect('/admin/categorias')
    }).catch(err =>{
        req.flash('error_msg', `Erro ao deletar categoria [${err}]`)
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens',  (req, res)=>{
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch(err => {
        req.flash('error_msg', `Não foi possível listar as postagens [${err}]`)
        res.redirect('/admin')
    })
}
)

router.get('/postagens/add', eAdmin, (req, res)=>{
    Categoria.find().then((categorias)=>{
    res.render('admin/addpostagem', {categorias:categorias})
    }).catch(err =>{
        req.flash('error_msg', `Erro ao procurar categoria [${err}]`)
        res.redirect('/admin')
    })
    
})

router.post('/postagens/nova',eAdmin, (req, res)=>{
    let erros = []

    if(req.body.categoria == 0){
        erros.push({text: "Categoria inválida! Registre uma."})
    }
    if(erros.length > 0){
        res.render('/admin/addpostagem', {erros: erros})

    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
            
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Post criado com sucesso!')
            res.redirect('/admin/postagens')
        }).catch(err =>{
            req.flash('error_msg', `Erro ao criar postagem [${err}]`)
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagens)=>{
    

    Categoria.find().then((categorias)=>{ 
        res.render('admin/editpostagens', {categorias:categorias, postagens: postagens})

    }).catch(err =>{
        req.flash('error_msg', `Erro ao carregar dados [${err}]`)
        res.redirect('/admin/postagens')
    })
    

    }).catch(err =>{
        req.flash('error_msg', `Erro ao carregar dados [${err}]`) 
        res.redirect('/admin/postagens')
        
    })
    
})
router.post('/postagens/edit', eAdmin, (req, res)=>{   
    Postagem.findOne({_id: req.body.id}).then((postagens)=>{

        postagens.titulo = req.body.titulo,
        postagens.slug = req.body.slug,
        postagens.descricao = req.body.descricao,
        postagens.conteudo = req.body.conteudo,
        postagens.categoria = req.body.categoria

        postagens.save().then(()=>{
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')

        }).catch(err =>{
            req.flash('error_msg', `Erro ao atualizar informações [${err}]`)
            res.redirect('/admin/postagens')
        })
        

    }).catch(err =>{
         req.flash('error_msg', `Erro ao carregar dados [${err}]`)
         res.redirect('/admin/postagens')
    })

})
router.get('/postagens/deletar/:id', eAdmin, (req, res)=>{
    Postagem.remove({_id:req.params.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada')
        res.redirect('/admin/postagens')

    }).catch(err =>{
        req.flash('error_msg', `Erro ao deletar postagem [${err}]`)
    })
})

module.exports = router