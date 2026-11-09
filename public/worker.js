import {profile,createProfiler} from './core.mjs';
self.onmessage=async({data})=>{try{let result;if(data.file){const p=createProfiler(data.baseline);for await(const text of data.file.stream().pipeThrough(new TextDecoderStream()))p.push(text);result=p.finish();}else result=profile(data.csv,data.baseline);self.postMessage({result});}catch(e){self.postMessage({error:e.message});}};
