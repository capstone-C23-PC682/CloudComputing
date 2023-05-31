const jwt = require('jsonwebtoken');
function authToken(req,res,next){
    const headerAuth= req.headers['authorization']
    const token =headerAuth&&headerAuth.split(' ')[1]
    if(token==null) return res.sendStatus(401)
    jwt.verify(token,'apa aja boleh lhaa',(err,account)=>{
        if(err) return res.sendStatus(403)
        req.account=account;
        next();
    })
}
module.exports=authToken;