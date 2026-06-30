const http = require('http');
const req = http.request({hostname:'localhost',port:8081,path:'/index.bundle?platform=android&dev=true',method:'GET'}, (res) => {
  let d = ''; res.on('data',c=>d += c); res.on('end',()=>{
    if(res.statusCode === 500){try{const j = JSON.parse(d); console.log('ERROR:',j.message?.substring(0,300));}catch(e){console.log('500 raw:',d.substring(0,300));}}
    else {console.log('OK status:',res.statusCode,'size:',d.length);}
  });
});
req.on('error',e=>console.error(e));
req.end();
