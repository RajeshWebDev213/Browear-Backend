const sql = require("mysql2")
const dotenv = require('dotenv')
dotenv.config()
const Database = sql.createConnection({
    host:process.env.BroWear_DB_Host,
    user:process.env.BroWear_DB_User,
    password:process.env.BroWear_DB_Password,
    database:process.env.BroWear_DB_Database,
    port:process.env.BroWear_DB_Port
})
Database.connect(err=>{
    if(err){
        console.log("error is fetched",err)
    }
    console.log("Data base connected successfully")
    Database.query('select * from signupusersData',(err,result)=>{
         if(err){
            console.log("The error is : ",err)
         }
         console.log("the user details are: ",result)
         
    })
})
module.exports = {Database}
