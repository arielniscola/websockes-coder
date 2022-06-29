const express = require('express')
const fs = require('fs');
const { Server: IOServer } = require('socket.io')
const path = require('path');
const { measureMemory } = require('vm');
const app = express()
const serverExpress = app.listen(8080, () => console.log('Servidor escuchando puerto 8080'))
const io = new IOServer(serverExpress)
const products = [{title: "regla", price: 140, thumbnail:"google.com"}]
let messagesData = JSON.parse(fs.readFileSync('./src/public/message.txt', 'utf-8'));


app.use(express.static(path.join(__dirname, './public')))


io.on('connection', socket => {
    console.log(`Se conecto un usuario ${socket.id}`)
    io.emit('server:message', messagesData)

    io.emit('server:products', products)

    socket.on('client:message', messageInfo => {

        messagesData.push(messageInfo);
       
        //almacenar mensaje archivo
        save();
        io.emit('server:message', messagesData)
    })

    socket.on('client:product', productForm => {
        products.push(productForm);
        io.emit('server:products', products)
    })
})

async function save(){
    try{
        console.log(messagesData);
        await fs.promises.writeFile('./src/public/message.txt', JSON.stringify(messagesData));
        console.log('guardado')
    }catch(err){
        console.log('no se pudo guardar el chat', err)
    }

}