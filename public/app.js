const $=id=>document.getElementById(id);
const sample={name:"minha-aplicacao",license:"MIT",dependencies:{react:"^19.0.0",express:"4.21.0",lodash:"~4.17.21"},devDependencies:{typescript:"^5.0.0",vitest:"*"},optionalDependencies:{"minha-lib":"file:../local"}};
let report=null;
$("sample").addEventListener("click",()=>{$("manifest").value=JSON.stringify(sample,null,2);});
$("clear").addEventListener("click",()=>{$("manifest").value="";$("file").value="";$("error").textContent="";$("results").classList.add("hidden");report=null;});
$("file").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;if(f.size>2_000_000){$("error").textContent="Arquivo acima de 2 MB.";return;}$("manifest").value=await f.text();});
function render(){
  const search=$("filter").value.toLowerCase(),section=$("section").value;
  const list=report.dependencies.filter(x=>x.name.toLowerCase().includes(search)&&(!section||x.section===section));
  const body=$("rows");body.replaceChildren();
  for(const item of list){const tr=document.createElement("tr");for(const value of [item.name,item.version,item.section,item.classification]){const td=document.createElement("td");td.textContent=value;tr.append(td);}body.append(tr);}
}
$("analyze").addEventListener("click",async()=>{
  $("error").textContent="";
  try{
    const raw=$("manifest").value;if(new Blob([raw]).size>2_000_000)throw new Error("Arquivo acima de 2 MB.");
    const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:raw});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Erro desconhecido.");
    report=data;$("project").textContent=data.project+" · "+data.license;
    const metrics=$("summary");metrics.replaceChildren();
    for(const [label,count] of [["Total",data.count],...Object.entries(data.totals)]){const div=document.createElement("div");div.className="metric";const strong=document.createElement("strong"),span=document.createElement("span");strong.textContent=count;span.textContent=label;div.append(strong,span);metrics.append(div);}
    $("results").classList.remove("hidden");render();
  }catch(e){$("error").textContent=e.message;}
});
$("filter").addEventListener("input",render);$("section").addEventListener("change",render);
$("export").addEventListener("click",()=>{
 if(!report)return;
 const esc=v=>'"'+String(v).replaceAll('"','""')+'"';
 const csv=[["pacote","versao","grupo","classificacao"],...report.dependencies.map(x=>[x.name,x.version,x.section,x.classification])].map(row=>row.map(esc).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="dependency-radar.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
