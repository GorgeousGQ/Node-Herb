//导入 express
const express = require('express');
const joi = require('joi')
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer')

const app = express();

//对外提供静态资源
app.use(express.static('./uploads'))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//设置json数据大小限制为10mb
app.use(express.json({ limit:'10mb'}))
//设置urlencoded数据大小限制为10mb
app.use(express.urlencoded({ limit:'10mb', extended:true }))

//封装一个 res.cc 函数
app.use((req,res,next)=>{
    res.cc = function(err,status = 1){
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})


//配置解析 Token 的中间件
const expressJWT = require('express-jwt')
const config = require('./config')
//除了以/api开头的接口其他的都要进行身份验证
app.use(expressJWT({secret: config.jwtSecretKey}).unless({path: [/^\/api/]}))

const upload = multer({dest:'uploads/articlepic'})

//导入并使用路由模块
const userRouter = require('./router/user')
app.use('/api',userRouter)
const userinfoRouter = require('./router/userinfo')
app.use('/admin',userinfoRouter)

//定义错误级别的中间件:错误中间件
app.use((err, req, res, next) => {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
    // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

// //启动服务器
// app.listen(2001,() => {
//     console.log('api server running at http://127.0.0.1:2001');
// })

//启动服务器
app.listen(3000,() => {
  console.log('api server running at http://127.0.0.1:3000');
})