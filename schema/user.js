/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

//导入定义验证规则的包
const joi = require('joi')

//定义用户名和密码的验证规则
const username = joi.string().alphanum().min(4).max(20).required()
const password = joi.string().pattern(/^[\S]{6,20}$/).required()
const reg_nickname = joi.string()

const id = joi.number().required()
const nickname = joi.string().required()
const email = joi.string().email().required()
const mydesc = joi.string()

const avatar = joi.string().dataUri().required()

//定义验证注册和登录表单数据的规则对象
exports.reg_login_schema = {
    body:{
        username,
        password,
        nickname:reg_nickname,
    }
}

//定义验证更新用户信息表单数据的规则对象
exports.update_userinfo_schema = {
    body:{
        id,
        nickname,
        email,
        mydesc,
    }
}

//定义验证用户头像的规则对象
exports.update_avatar_schema = {
    body:{
        avatar
    }
}