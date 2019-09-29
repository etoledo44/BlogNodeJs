const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/', (req, res)=>{
    res.send('oi')
})
router.get('/registro', (req, res)=>{
    res.render('registrar/index')
})
router.post('/registro', (req, res)=>{
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "e-mail inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválido"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito curta'})
    }
    if(req.body.senha != req.body.resenha){
        erros.push({texto: 'Senhas não batem'})
    }
    if(erros.length > 0){
        res.render('registrar/index', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'e-mail já cadastrado!')
                res.redirect('/usuario/registro')

            }else{
                 const novoUsuario = ({
                     nome: req.body.nome,
                     email: req.body.email,
                     senha: req.body.senha
                 })

                 bcrypt.genSalt(10, (err, salt)=>{
                     bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                         if(err){
                             req.flash('error_msg', `Erro durante o salvamento do usuário [${err}]`)
                             res.redirect('/')
                         }
                         novoUsuario.senha = hash

                         new Usuario(novoUsuario).save().then(()=>{
                             req.flash('success_msg', 'Conta criada com sucesso!')
                             res.redirect('/admin')
                         }).catch(err =>{
                            req.flash('error_msg', `Houve um erro na criação de usuário [${err}]`)
                            res.redirect('/registro')
                         })
                     })
                 })
                // const novoUsuario = new Usuario({
                //     nome: req.body.nome,
                //     email: req.body.email,
                //     senha: req.body.senha
                // })
                // bcrypt.genSalt(10, (err, salt)=>{
                //     bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                //         if(err){
                //             req.flash('error_msg', `Erro durante o cadastro [${err}]`)
                //             res.redirect('/')
                //         }
                //             novoUsuario.senha = hash

                //             novoUsuario.save().then(()=>{
                //                 req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                //                 res.redirect('/')
                //             }).catch(err=>{
                //                 req.flash('error_msg', `Erro ao criar cadastro`)
                //                 res.redirect('/')
                //             })
                        
                //     })
                // })


            }
        }).catch(err =>{
            req.flash('error_msg', `Erro [${err}]`)
        })

    }
})
router.get('/login', (req, res)=>{
    res.render('login/index')
})

router.post('/login', (req, res, next)=>{

    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res)=>{
    req.logout() //passport vai fazer o logout automaticamente
    req.flash('success_msg', 'Você saiu, te vejo em breve!')
    res.redirect('/')
})


module.exports = router