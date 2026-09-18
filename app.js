(function(){'use strict';
var KEY='reflashWorkModeV2',state=load(),currentClientId=null,currentPropertyId=null;
function $(id){return document.getElementById(id)}function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{var s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return clone(WORK_DATA)}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]})}
function show(id,title){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});$(id).classList.add('active');$('pageTitle').textContent=title||'Work Mode';document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.dataset.screen===id)});renderAll()}
function makeTask(text,category){return{id:'task-'+Date.now()+'-'+Math.random().toString(16).slice(2),text:text,done:false,category:category||'General'}}
function renderDaily(){$('dailyTasks').innerHTML=state.dailyTasks.length?state.dailyTasks.map(function(t){return'<div class="taskRow '+(t.done?'done':'')+'" data-task="'+t.id+'"><input type="checkbox" '+(t.done?'checked':'')+'><div class="taskText"><div>'+esc(t.text)+'</div><div class="taskCategory">'+esc(t.category)+'</div></div><button class="textButton deleteTask">Delete</button></div>'}).join(''):'<div class="empty">No tasks for today.</div>';document.querySelectorAll('[data-task]').forEach(function(r){r.querySelector('input').onchange=function(){var t=state.dailyTasks.find(function(x){return x.id===r.dataset.task});t.done=this.checked;save();renderDaily()};r.querySelector('.deleteTask').onclick=function(){state.dailyTasks=state.dailyTasks.filter(function(x){return x.id!==r.dataset.task});save();renderDaily()}})}
function clientCard(c){return'<div class="clientCard" data-client="'+c.id+'"><div class="cardIcon">👤</div><div class="grow"><strong>'+esc(c.name)+'</strong><div class="meta">'+esc(c.type)+' • '+esc(c.status)+'</div></div><div>›</div></div>'}
function renderClients(){var q=($('clientSearch').value||'').toLowerCase(),list=state.clients.filter(function(c){return!q||(c.name+' '+c.type+' '+c.status).toLowerCase().indexOf(q)!==-1});$('clientList').innerHTML=list.length?list.map(clientCard).join(''):'<div class="empty">No clients found.</div>';$('rentalClients').innerHTML=state.clients.filter(function(c){return c.type==='Rental'}).map(clientCard).join('')||'<div class="empty">No rental clients yet.</div>';$('salesClients').innerHTML=state.clients.filter(function(c){return c.type==='Residential Sale'}).map(clientCard).join('')||'<div class="empty">No residential sales clients yet.</div>';document.querySelectorAll('[data-client]').forEach(function(r){r.onclick=function(){openClient(r.dataset.client)}})}
function propertyCard(p){return'<div class="propertyCard" data-property="'+p.id+'"><div class="cardIcon">🏠</div><div class="grow"><strong>'+esc(p.address)+'</strong><div class="meta">'+esc(p.type)+' • '+esc(p.status)+'</div></div><div>›</div></div>'}
function renderProperties(){var q=($('propertySearch').value||'').toLowerCase(),list=state.properties.filter(function(p){return!q||(p.address+' '+p.type+' '+p.status).toLowerCase().indexOf(q)!==-1});$('propertyList').innerHTML=list.length?list.map(propertyCard).join(''):'<div class="empty">No properties found.</div>';document.querySelectorAll('[data-property]').forEach(function(r){r.onclick=function(){openProperty(r.dataset.property)}})}
function newClient(){var c={id:'client-'+Date.now(),name:'New Client',type:'Residential Sale',status:'Lead',phone:'',email:'',notes:'',tasks:[]};state.clients.unshift(c);save();openClient(c.id)}
function openClient(id){var c=state.clients.find(function(x){return x.id===id});if(!c)return;currentClientId=id;$('clientName').value=c.name;$('clientType').value=c.type;$('clientStatus').value=c.status;$('clientPhone').value=c.phone;$('clientEmail').value=c.email;$('clientNotes').value=c.notes;show('clientDetail',c.name)}
function saveClient(){var c=state.clients.find(function(x){return x.id===currentClientId});if(!c)return;c.name=$('clientName').value||'Untitled Client';c.type=$('clientType').value;c.status=$('clientStatus').value;c.phone=$('clientPhone').value;c.email=$('clientEmail').value;c.notes=$('clientNotes').value;save();show('clients','Clients')}
function deleteClient(){if(!currentClientId)return;if(confirm('Delete this client?')){state.clients=state.clients.filter(function(c){return c.id!==currentClientId});state.properties.forEach(function(p){if(p.clientId===currentClientId)p.clientId=''});save();show('clients','Clients')}}
function renderClientTasks(){var c=state.clients.find(function(x){return x.id===currentClientId});if(!c){$('clientTasks').innerHTML='';return}$('clientTasks').innerHTML=c.tasks.length?c.tasks.map(function(t){return'<div class="taskRow '+(t.done?'done':'')+'" data-client-task="'+t.id+'"><input type="checkbox" '+(t.done?'checked':'')+'><div class="taskText">'+esc(t.text)+'</div></div>'}).join(''):'<div class="empty">No client tasks.</div>';document.querySelectorAll('[data-client-task]').forEach(function(r){r.querySelector('input').onchange=function(){var t=c.tasks.find(function(x){return x.id===r.dataset.clientTask});t.done=this.checked;save();renderClientTasks()}})}
function defaultChecklist(){return['Verify listing status and showing instructions','Confirm appointment with client','Review taxes, property details, and disclosures','Arrive early and verify address','Observe exterior and neighborhood','Record buyer questions and feedback','Turn off lights and secure doors','Send follow-up and update notes'].map(function(t,i){return{id:'show-'+Date.now()+'-'+i,text:t,done:false}})}
function newProperty(){var p={id:'property-'+Date.now(),address:'New Property',type:'Residential Sale',status:'Research',clientId:'',notes:'',showingChecklist:defaultChecklist()};state.properties.unshift(p);save();openProperty(p.id)}
function openProperty(id){var p=state.properties.find(function(x){return x.id===id});if(!p)return;currentPropertyId=id;$('propertyAddress').value=p.address;$('propertyType').value=p.type;$('propertyStatus').value=p.status;$('propertyNotes').value=p.notes;$('propertyClient').innerHTML='<option value="">No client assigned</option>'+state.clients.map(function(c){return'<option value="'+c.id+'" '+(c.id===p.clientId?'selected':'')+'>'+esc(c.name)+'</option>'}).join('');show('propertyDetail',p.address)}
function saveProperty(){var p=state.properties.find(function(x){return x.id===currentPropertyId});if(!p)return;p.address=$('propertyAddress').value||'Untitled Property';p.type=$('propertyType').value;p.status=$('propertyStatus').value;p.clientId=$('propertyClient').value;p.notes=$('propertyNotes').value;save();show('properties','Properties')}
function deleteProperty(){if(!currentPropertyId)return;if(confirm('Delete this property?')){state.properties=state.properties.filter(function(p){return p.id!==currentPropertyId});save();show('properties','Properties')}}
function renderChecklist(){var p=state.properties.find(function(x){return x.id===currentPropertyId});if(!p){$('showingChecklist').innerHTML='';return}$('showingChecklist').innerHTML=p.showingChecklist.map(function(i){return'<label class="checklistItem '+(i.done?'done':'')+'" data-check="'+i.id+'"><input type="checkbox" '+(i.done?'checked':'')+'><span>'+esc(i.text)+'</span></label>'}).join('');document.querySelectorAll('[data-check]').forEach(function(r){r.querySelector('input').onchange=function(){var i=p.showingChecklist.find(function(x){return x.id===r.dataset.check});i.done=this.checked;save();renderChecklist()}})}

var brainView='chapters',vaultDB=null;
function brainNotes(){return(state.brain&&state.brain.courseNotes)||[]}
function brainChapters(){return(state.brain&&state.brain.chapters)||[]}
function renderBrain(){
 var q=($('brainSearch').value||'').toLowerCase(),chapters=brainChapters(),notes=brainNotes();
 $('brainChapterList').innerHTML=chapters.filter(function(ch){
   var n=notes.find(function(x){return x.title===ch.title});
   return !q||(ch.title+' '+(n?n.body:'')+' '+ch.cards.map(function(c){return c.q+' '+c.a}).join(' ')).toLowerCase().indexOf(q)!==-1;
 }).map(function(ch){
   return '<div class="brainChapter" data-brain-chapter="'+ch.id+'"><div class="brainChapterIcon">📘</div><div class="grow"><strong>'+esc(ch.title)+'</strong><div class="meta">'+ch.cards.length+' flashcards</div></div><div>›</div></div>';
 }).join('')||'<div class="empty">No chapters found.</div>';
 var cards=[];
 chapters.forEach(function(ch){ch.cards.forEach(function(c){
   if(!q||(ch.title+' '+c.q+' '+c.a).toLowerCase().indexOf(q)!==-1){
     cards.push('<div class="brainCard"><small>'+esc(ch.title)+'</small><strong>'+esc(c.q)+'</strong><p>'+esc(c.a)+'</p></div>');
   }
 })});
 $('brainCardList').innerHTML=cards.join('')||'<div class="empty">No flashcards found.</div>';
 document.querySelectorAll('[data-brain-chapter]').forEach(function(r){r.onclick=function(){openBrainChapter(r.dataset.brainChapter)}});
}
function openBrainChapter(id){
 var ch=brainChapters().find(function(x){return x.id===id});if(!ch)return;
 var n=brainNotes().find(function(x){return x.title===ch.title});
 $('brainDetailTitle').textContent=ch.title;
 $('brainDetailBody').textContent=n?n.body:'No raw course note is attached to this chapter.';
 $('brainDetailCards').innerHTML=ch.cards.map(function(c){return'<div class="brainCard"><strong>'+esc(c.q)+'</strong><p>'+esc(c.a)+'</p></div>'}).join('');
 show('brainDetail',ch.title);
}
function setBrainView(v){
 brainView=v;document.querySelectorAll('.brainMode').forEach(function(b){b.classList.toggle('active',b.dataset.brainView===v)});
 $('brainChapterList').classList.toggle('hidden',v!=='chapters');$('brainCardList').classList.toggle('hidden',v!=='cards');
}
function openVaultDB(){
 return new Promise(function(resolve,reject){
  if(vaultDB){resolve(vaultDB);return}
  var req=indexedDB.open('ZadsREFLASHAPPVault',1);
  req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains('files'))db.createObjectStore('files',{keyPath:'id'})};
  req.onsuccess=function(){vaultDB=req.result;resolve(vaultDB)};req.onerror=function(){reject(req.error)};
 });
}
function categoryFor(f){
 if(f.type.indexOf('image/')===0)return'Photo';
 if(f.type.indexOf('audio/')===0)return'Audio';
 if(f.type==='application/pdf'||/\.(docx?|txt|rtf|csv|xlsx?)$/i.test(f.name))return'Document';
 return'Other';
}
function addVaultFiles(files){
 if(!files||!files.length)return;$('vaultStatus').textContent='Saving files…';
 openVaultDB().then(function(db){
  var tx=db.transaction('files','readwrite'),store=tx.objectStore('files');
  Array.from(files).forEach(function(f){store.put({id:'file-'+Date.now()+'-'+Math.random().toString(16).slice(2),name:f.name,type:f.type||'application/octet-stream',size:f.size,category:categoryFor(f),created:new Date().toISOString(),blob:f})});
  tx.oncomplete=function(){$('vaultStatus').textContent='Files saved locally on this device.';renderVault()};
  tx.onerror=function(){$('vaultStatus').textContent='Could not save files.'};
 }).catch(function(){$('vaultStatus').textContent='Local file storage is unavailable.'});
}
function getVaultFiles(){return openVaultDB().then(function(db){return new Promise(function(resolve,reject){var r=db.transaction('files','readonly').objectStore('files').getAll();r.onsuccess=function(){resolve(r.result||[])};r.onerror=function(){reject(r.error)}})})}
function deleteVaultFile(id){openVaultDB().then(function(db){var tx=db.transaction('files','readwrite');tx.objectStore('files').delete(id);tx.oncomplete=renderVault})}
function openVaultFile(id){getVaultFiles().then(function(fs){var f=fs.find(function(x){return x.id===id});if(!f)return;var u=URL.createObjectURL(f.blob),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000)})}
function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(1)+' MB'}
function iconFor(f){if(f.category==='Photo')return'🖼️';if(f.category==='Audio')return'🎙️';if(f.type==='application/pdf')return'📕';if(f.category==='Document')return'📄';return'📦'}
function renderVault(){
 var q=($('vaultSearch').value||'').toLowerCase(),cat=$('vaultCategory').value;
 getVaultFiles().then(function(fs){
  fs.sort(function(a,b){return new Date(b.created)-new Date(a.created)});
  fs=fs.filter(function(f){return(cat==='All'||f.category===cat)&&(!q||f.name.toLowerCase().indexOf(q)!==-1)});
  $('vaultList').innerHTML=fs.length?fs.map(function(f){return'<div class="vaultItem"><div class="vaultIcon">'+iconFor(f)+'</div><div class="grow"><strong>'+esc(f.name)+'</strong><div class="meta">'+esc(f.category)+' • '+formatBytes(f.size)+'</div></div><div class="vaultActions"><button data-open-file="'+f.id+'">Open</button><button data-delete-file="'+f.id+'">Delete</button></div></div>'}).join(''):'<div class="empty">No uploaded files found.</div>';
  document.querySelectorAll('[data-open-file]').forEach(function(b){b.onclick=function(){openVaultFile(b.dataset.openFile)}});
  document.querySelectorAll('[data-delete-file]').forEach(function(b){b.onclick=function(){if(confirm('Delete this local file?'))deleteVaultFile(b.dataset.deleteFile)}});
 }).catch(function(){$('vaultList').innerHTML='<div class="empty">Vault storage is unavailable.</div>'});
}

function renderAll(){renderDaily();renderClients();renderProperties();renderClientTasks();renderChecklist();renderBrain();renderVault()}
document.querySelectorAll('.tab').forEach(function(t){t.onclick=function(){show(t.dataset.screen,t.querySelector('small').textContent)}});document.querySelectorAll('.modeCard').forEach(function(b){b.onclick=function(){show(b.dataset.mode,b.querySelector('strong').textContent)}});document.querySelectorAll('.backButton').forEach(function(b){b.onclick=function(){show(b.dataset.back,b.dataset.back==='clients'?'Clients':'Properties')}});
$('addButton').onclick=function(){show('addMenu','Create')};$('newTaskButton').onclick=function(){var t=prompt('New daily task');if(t){state.dailyTasks.unshift(makeTask(t,'General'));save();renderDaily()}};$('newClientButton').onclick=newClient;$('newPropertyButton').onclick=newProperty;$('clientSearch').oninput=renderClients;$('propertySearch').oninput=renderProperties;$('saveClient').onclick=saveClient;$('deleteClient').onclick=deleteClient;$('addClientTask').onclick=function(){var c=state.clients.find(function(x){return x.id===currentClientId}),t=prompt('New client task');if(c&&t){c.tasks.push(makeTask(t,'Client'));save();renderClientTasks()}};$('saveProperty').onclick=saveProperty;$('deleteProperty').onclick=deleteProperty;$('resetShowing').onclick=function(){var p=state.properties.find(function(x){return x.id===currentPropertyId});if(p){p.showingChecklist.forEach(function(i){i.done=false});save();renderChecklist()}};$('addMenuClient').onclick=newClient;$('addMenuProperty').onclick=newProperty;$('addMenuTask').onclick=function(){var t=prompt('New daily task');if(t){state.dailyTasks.unshift(makeTask(t,'General'));save();show('dashboard','Work Mode')}};document.querySelectorAll('.brainMode').forEach(function(b){b.onclick=function(){setBrainView(b.dataset.brainView)}});
$('brainSearch').oninput=renderBrain;
$('vaultInput').onchange=function(){addVaultFiles(this.files);this.value=''};
$('vaultSearch').oninput=renderVault;
$('vaultCategory').onchange=renderVault;
setBrainView('chapters');
renderAll();})();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){})})}