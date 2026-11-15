import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {join, extname, normalize} from "node:path";
import {fileURLToPath} from "node:url";
import {analyzeManifest} from "./src/analyzer.js";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const port = Number(process.env.PORT || 3000);
const server = createServer(async (req,res)=>{
  const send=(status,body,type="application/json; charset=utf-8")=>{res.writeHead(status,{"Content-Type":type,"X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(body);};
  if(req.method==="GET" && req.url==="/health") return send(200,JSON.stringify({status:"ok"}));
  if(req.method==="POST" && req.url==="/api/analyze"){
    let raw="",size=0;
    try {
      for await(const chunk of req){size+=chunk.length;if(size>2_000_000) throw new Error("Arquivo acima de 2 MB.");raw+=chunk.toString("utf8");}
      return send(200,JSON.stringify(analyzeManifest(raw)));
    }catch(error){return send(400,JSON.stringify({error:error.message}));}
  }
  if(req.method!=="GET") return send(405,JSON.stringify({error:"Método não permitido."}));
  const pathname = (req.url || "/").split("?")[0];
  let decoded;
  try{decoded=decodeURIComponent(pathname);}catch{return send(400,JSON.stringify({error:"Caminho inválido."}));}
  if(decoded.includes("\\") || decoded.includes("..")) return send(403,JSON.stringify({error:"Acesso negado."}));
  const path=normalize(decoded==="/"?"index.html":decoded.replace(/^\//,""));
  if(!["index.html","app.js","style.css"].includes(path)) return send(404,JSON.stringify({error:"Não encontrado."}));
  try{return send(200,await readFile(join(root,path),"utf8"),mime[extname(path)]);}catch{return send(404,JSON.stringify({error:"Não encontrado."}));}
});
server.listen(port, "0.0.0.0",()=>console.log(`Dependency Radar em http://localhost:${port}`));
