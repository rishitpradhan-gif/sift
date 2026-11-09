import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {profile} from './core.mjs';
const MAX=5*1024*1024;
export const server=createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
 if(req.method==='GET'&&req.url==='/health')return send(200,{status:'ok',service:'Sift',version:'0.1.0'});
 if(req.method==='GET'&&req.url==='/openapi.json')return send(200,JSON.parse(readFileSync(new URL('./openapi.json',import.meta.url))));
 if(req.url!=='/v1/profile')return send(404,{error:'Not found'});
 if(req.method!=='POST')return send(405,{error:'Use POST'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Use application/json'});
 let chunks=[],bytes=0;
 try{for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX){send(413,{error:'Request exceeds 5 MiB'});req.resume();return;}chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));send(200,profile(body.csv,body.baseline));}catch(e){if(!res.headersSent)send(400,{error:e.message});}
});
server.requestTimeout=30000;server.headersTimeout=10000;
if(process.argv[1]&&import.meta.url===new URL(process.argv[1],'file:').href){const port=Number(process.env.PORT||8787);const host=process.env.HOST||'127.0.0.1';server.listen(port,host,()=>console.log('Sift API listening on http://'+host+':'+port));}
