import {createReadStream,readFileSync} from 'node:fs';
import {createProfiler} from './core.mjs';
try{if(!process.argv[2])throw Error('Usage: node cli.mjs data.csv [baseline.json]');const p=createProfiler(process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):null);for await(const chunk of createReadStream(process.argv[2],{encoding:'utf8'}))p.push(chunk);console.log(JSON.stringify(p.finish(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
