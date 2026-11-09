/** Bounded-cardinality CSV profiling. RFC-style doubled quotes and chunk boundaries. */
export class CsvParser {
 constructor(onRow){this.onRow=onRow;this.row=[];this.field='';this.mode='plain';this.cr=false;this.started=false;this.count=0;}
 push(text){for(const ch of text){if(!this.started){this.started=true;if(ch==='\ufeff')continue;}if(this.cr){this.cr=false;if(ch==='\n')continue;}
 if(this.mode==='quoted'){if(ch==='"')this.mode='after';else this.add(ch);continue;}
 if(this.mode==='after'){if(ch==='"'){this.add('"');this.mode='quoted';continue;}if(ch!==','&&ch!=='\n'&&ch!=='\r')throw Error('Unexpected character after closing quote.');}
 if(ch===','){this.endField();continue;}if(ch==='\n'||ch==='\r'){this.endField();this.emit();this.cr=ch==='\r';continue;}
 if(ch==='"'){if(this.field.length)throw Error('Quote inside an unquoted field.');this.mode='quoted';continue;}this.add(ch);
 }}
 add(c){this.field+=c;if(this.field.length>1024*1024)throw Error('A field exceeds the 1,048,576-character safety limit.');}
 endField(){this.row.push(this.field);if(this.row.length>128)throw Error('At most 128 columns are supported.');this.field='';this.mode='plain';}
 emit(){this.onRow(this.row);this.row=[];this.count++;}
 finish(){if(this.mode==='quoted')throw Error('Unclosed quoted field.');if(this.field.length||this.row.length||this.mode==='after'){this.endField();this.emit();}}
}
export function valueType(value){
 if(/^(true|false)$/i.test(value))return 'boolean';
 if(/^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)&&Number.isFinite(Number(value)))return 'number';
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)){const d=new Date(value+'T00:00:00Z');if(!isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value)return 'date';}
 return 'string';
}
export function createProfiler(baseline=null){
 let columns=null,rows=0,ragged=0,blank=0;const samples=[];
 const parser=new CsvParser(row=>{
 if(!columns){if(row.length===1&&row[0]==='')return;const names=row.map(x=>x.trim());if(names.some(x=>!x)||new Set(names).size!==names.length)throw Error('Headers must be nonempty and unique.');columns=names.map(name=>({name,missing:0,types:{},distinct:new Set(),capped:false,min:null,max:null}));return;}
 if(row.every(x=>x==='')){blank++;return;}rows++;
 if(row.length!==columns.length){ragged++;if(samples.length<8)samples.push({record:rows+1,expected:columns.length,actual:row.length});}
 columns.forEach((c,i)=>{const v=(row[i]??'').trim();if(v===''){c.missing++;return;}const type=valueType(v);c.types[type]=(c.types[type]??0)+1;if(c.distinct.size<256)c.distinct.add(v);else if(!c.distinct.has(v))c.capped=true;if(type==='number'){const n=Number(v);c.min=c.min===null?n:Math.min(c.min,n);c.max=c.max===null?n:Math.max(c.max,n);}});
 });
 return {push:t=>parser.push(t),finish(){parser.finish();if(!columns)throw Error('The CSV needs a header row.');const result={version:'1.0',rows,columns:columns.map(c=>({name:c.name,missing:c.missing,missingRate:rows?c.missing/rows:0,type:Object.keys(c.types).length===0?'empty':Object.keys(c.types).length===1?Object.keys(c.types)[0]:'mixed',types:c.types,distinct:c.distinct.size,distinctIsLowerBound:c.capped,min:c.min,max:c.max})),raggedRows:ragged,skippedBlankRecords:blank,raggedSamples:samples,drift:[]};
 if(baseline){if(!Array.isArray(baseline.columns)||baseline.columns.some(c=>typeof c.name!=='string'||typeof c.type!=='string'))throw Error('Baseline must be a Sift report with named, typed columns.');const old=new Map(baseline.columns.map(c=>[c.name,c.type]));for(const c of result.columns){if(!old.has(c.name))result.drift.push({column:c.name,change:'added'});else if(old.get(c.name)!==c.type)result.drift.push({column:c.name,change:'type',before:old.get(c.name),after:c.type});old.delete(c.name);}for(const name of old.keys())result.drift.push({column:name,change:'removed'});}
 return result;}};
}
export function profile(csv,baseline=null){if(typeof csv!=='string')throw Error('csv must be a string.');const p=createProfiler(baseline);p.push(csv);return p.finish();}
