const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

const mysql = require('mysql2/promise')

const DB_USERNAME = 'anghelcristina'
const DB_PASSWORD = 'anghelc74'

let conn

mysql.createConnection({
    user : DB_USERNAME,
    password : DB_PASSWORD
})
.then((connection) => {
    conn = connection
    return connection.query('CREATE DATABASE IF NOT EXISTS tw_exam')
})
.then(() => {
    return conn.end()
})
.catch((err) => {
    console.warn(err.stack)
})

const sequelize = new Sequelize('tw_exam', DB_USERNAME, DB_PASSWORD,{
    dialect : 'mysql',
    logging: false
})

let Student = sequelize.define('student', {
    name : Sequelize.STRING,
    address : Sequelize.STRING,
    age : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
app.use(bodyParser.json())

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let student = new Student({
                name : 'name ' + i,
                address : 'some address on ' + i + 'th street',
                age : 30 + i
            })
            await student.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/students', async (req, res) => {
    try{
        let students = await Student.findAll()
        res.status(200).json(students)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/students', async (req, res) => {
    try{
        if(req.body.age<0){
            res.status(400).json({"message":"age should be a positive number"})
        }
        else if(Object.keys(req.body).length===0){
            res.status(400).json({"message":"body is missing"})
        }
       else
        if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('age')||!req.body.hasOwnProperty('address'))
        {
            res.status(400).json({"message":"malformed request"})
        }
       else
       {
            let student = new Student({
                name : req.body.name,
                address : req.body.address,
                age : parseInt(req.body.age)
            })
            await student.save()
            
            res.status(201).json({"message" : 'created'})
           
           }
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({"message" : "server error"})        
    }
})

module.exports = app