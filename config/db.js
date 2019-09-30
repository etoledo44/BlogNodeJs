if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://deploy:uploadapp@cluster0-h4v5x.mongodb.net/test?retryWrites=true&w=majority'}

}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}

//funcao que verifica se a aplicação está em ambiente de producao ou desenvolvimento 