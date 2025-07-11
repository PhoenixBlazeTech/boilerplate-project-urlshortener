require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

let urls = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',(req,res)=>{
    const input = req.body.url;
    if(!/^https?:\/\//.test(input)){
        return res.json({erroror:'invalid url'});
    }
    let hostname;
    try{
      const parsedUrl = new URL (input);
      hostname = parsedUrl.hostname;
    }catch(error){
      return res.json({error:'invalid url'})
    }
    
    dns.lookup(hostname,(error,address)=>{
        if(error){
            return res.json({error:'invalid domain'})
        }else{
          const short = urls.length + 1;
          urls.push({"original_url":input,"short_url":short});

          res.json({"original_url":input,"short_url":short});
        }
    });
});

app.get('/api/shorturl/:short',(req,res)=>{
    const short = parseInt(req.params.short);
    const entry = urls.find(obj => obj.short_url == short);
    if(entry){
      res.redirect(entry.original_url);
    }else{
      res.status(404).send('URL no encontrada');
    }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
