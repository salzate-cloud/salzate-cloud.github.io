(function(){
  "use strict";
  var STORAGE_KEY = "mi-agenda-docente-colombia-v1";
  var HOUR_START = 6;
  var HOUR_END = 22;
  var HOUR_HEIGHT = 56;
  var DAYS = [
    {id:0,es:"Lunes",en:"Monday"},
    {id:1,es:"Martes",en:"Tuesday"},
    {id:2,es:"Miércoles",en:"Wednesday"},
    {id:3,es:"Jueves",en:"Thursday"},
    {id:4,es:"Viernes",en:"Friday"},
    {id:5,es:"Sábado",en:"Saturday"}
  ];
  var CATALOG = [
    {name:"Institución Universitaria de Envigado",code:"2302",abbr:"IUE",color:"#177a68"},
    {name:"Universidad de Antioquia",code:"1201",abbr:"UdeA",color:"#31754f"},
    {name:"Universidad Nacional de Colombia",code:"1101",abbr:"UNAL",color:"#b78627"},
    {name:"Universidad del Valle",code:"1203",abbr:"Univalle",color:"#356e9b"},
    {name:"Universidad Industrial de Santander",code:"1204",abbr:"UIS",color:"#c53f32"},
    {name:"Universidad Distrital Francisco José de Caldas",code:"1301",abbr:"UD",color:"#356a45"},
    {name:"Universidad EAFIT",code:"1712",abbr:"EAFIT",color:"#225c8d"},
    {name:"Universidad Pontificia Bolivariana",code:"1710",abbr:"UPB",color:"#bc3e3f"},
    {name:"Institución Universitaria ITM",code:"3302",abbr:"ITM",color:"#394f87"},
    {name:"Universidad de Medellín",code:"1812",abbr:"UdeM",color:"#bc3232"},
    {name:"Universidad del Cauca",code:"1110",abbr:"Unicauca",color:"#b63138"},
    {name:"Universidad de Caldas",code:"1112",abbr:"UCaldas",color:"#387347"},
    {name:"Universidad del Atlántico",code:"1202",abbr:"UniAtlántico",color:"#3f6eae"},
    {name:"Universidad Pedagógica Nacional",code:"1105",abbr:"UPN",color:"#3f4f8a"},
    {name:"Universidad Pedagógica y Tecnológica de Colombia",code:"1106",abbr:"UPTC",color:"#3c7a49"},
    {name:"Universidad Tecnológica de Pereira",code:"1111",abbr:"UTP",color:"#c09336"},
    {name:"Universidad de Nariño",code:"1206",abbr:"Udenar",color:"#3b6297"},
    {name:"Universidad Libre",code:"1806",abbr:"Unilibre",color:"#b23d37"},
    {name:"Universidad Externado de Colombia",code:"1706",abbr:"Externado",color:"#a33e46"},
    {name:"Universidad de La Sabana",code:"1711",abbr:"Unisabana",color:"#668241"},
    {name:"Universidad Antonio Nariño",code:"1826",abbr:"UAN",color:"#943f4b"},
    {name:"Universidad Tecnológica de Bolívar",code:"1832",abbr:"UTB",color:"#3868a5"},
    {name:"Universidad del Magdalena",code:"1213",abbr:"Unimagdalena",color:"#317557"},
    {name:"Universidad Nacional Abierta y a Distancia",code:"2102",abbr:"UNAD",color:"#c12e38"},
    {name:"Universidad Católica de Pereira",code:"2711",abbr:"UCP",color:"#3d5b8d"}
  ];
  var COPY = {
    es:{
      add:"Añadir al horario",save:"Guardar cambios",cancel:"Cancelar",edit:"Editar",remove:"Quitar",
      empty:"Tu semana está lista.",emptyText:"Añade la primera clase con el formulario y aparecerá aquí.",
      noClasses:"Aún no hay clases en tu agenda.",institutionAdded:"Institución guardada en tu directorio local.",
      saved:"Guardado en este navegador",savedOk:"Cambios guardados en este navegador",
      overlap:"Ese bloque se cruza con ",overlapEnd:". Ajusta el día o la hora antes de guardarlo.",
      timeError:"La hora debe estar entre 06:00 y 22:00 y la clase debe tener duración.",
      required:"Escribe una institución y una asignatura.",
      clearConfirm:"¿Borrar todas las clases de esta agenda? Las instituciones seguirán guardadas.",
      clearDone:"Clases borradas. El directorio de instituciones se conservó.",
      exportDone:"Copia de respaldo descargada.",
      importOk:"Copia restaurada correctamente.",
      importBad:"No pude leer esa copia. Selecciona un respaldo JSON de esta agenda.",
      imageBad:"Elige una imagen menor de 3 MB.",
      dialogDuplicate:"Esa institución ya aparece en tu directorio.",
      editLabel:"Guardar cambios",
      classCountOne:"clase",classCountMany:"clases",
      at:"en",notAvailable:"Institución sugerida",
      catalog:"Institución registrada en SNIES",
      restorePrompt:"Restaurar una copia puede reemplazar los datos guardados en este navegador. ¿Continuar?",
      untitled:"Asignatura"
    },
    en:{
      add:"Add to schedule",save:"Save changes",cancel:"Cancel",edit:"Edit",remove:"Remove",
      empty:"Your week is ready.",emptyText:"Add your first class with the form and it will appear here.",
      noClasses:"There are no classes in your schedule yet.",institutionAdded:"Institution saved to your local directory.",
      saved:"Saved in this browser",savedOk:"Changes saved in this browser",
      overlap:"This block overlaps with ",overlapEnd:". Adjust the day or time before saving.",
      timeError:"Use a time between 06:00 and 22:00 and give the class a duration.",
      required:"Enter an institution and a course.",
      clearConfirm:"Remove all classes from this schedule? Your institutions will stay saved.",
      clearDone:"Classes removed. Your institution directory is still saved.",
      exportDone:"Backup downloaded.",
      importOk:"Backup restored.",
      importBad:"I could not read that file. Choose a JSON backup from this schedule.",
      imageBad:"Choose an image smaller than 3 MB.",
      dialogDuplicate:"That institution is already in your directory.",
      editLabel:"Save changes",
      classCountOne:"class",classCountMany:"classes",
      at:"at",notAvailable:"Suggested institution",
      catalog:"Institution listed in SNIES",
      restorePrompt:"Restoring a backup may replace the schedule saved in this browser. Continue?",
      untitled:"Course"
    }
  };
  var state = {institutions:[],classes:[]};
  var editingId = null;
  var language = "es";
  function $(id){return document.getElementById(id);}
  function t(key){return (COPY[language]&&COPY[language][key])||COPY.es[key]||key;}
  function norm(value){return String(value||"").trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function makeId(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
  function timeMinutes(value){var p=String(value||"").split(":");return Number(p[0])*60+Number(p[1]);}
  function fmtTime(value){return String(value||"").slice(0,5);}
  function escapeData(value){return String(value||"").replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function initials(value){
    var parts=String(value||"").trim().split(/\s+/).filter(function(x){return !/^(de|del|la|las|los|y|the|of)$/i.test(x);});
    return parts.slice(0,3).map(function(x){return x.slice(0,1);}).join("").toUpperCase()||"IES";
  }
  function defaultState(){
    return {institutions:[],classes:[]};
  }
  function cleanInstitution(item){
    if(!item||typeof item.name!=="string"||!item.name.trim())return null;
    return {name:item.name.trim().slice(0,100),code:String(item.code||"").slice(0,16),abbr:String(item.abbr||initials(item.name)).slice(0,18),color:/^#[0-9a-f]{6}$/i.test(item.color||"")?item.color:"#3f7e73",logo:typeof item.logo==="string"&&item.logo.indexOf("data:image/")===0?item.logo:""};
  }
  function cleanMeeting(item){
    if(!item||typeof item.course!=="string"||typeof item.institution!=="string")return null;
    var day=Number(item.day),start=fmtTime(item.start),end=fmtTime(item.end);
    var sm=timeMinutes(start),em=timeMinutes(end);
    if(day<0||day>5||sm<HOUR_START*60||em>HOUR_END*60||em<=sm)return null;
    return {id:String(item.id||makeId()).slice(0,80),institution:item.institution.trim().slice(0,100),course:item.course.trim().slice(0,90),day:day,start:start,end:end,room:String(item.room||"").slice(0,70),color:/^#[0-9a-f]{6}$/i.test(item.color||"")?item.color:"#3f7e73"};
  }
  function loadState(){
    var raw=null;
    try{raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");}catch(e){}
    if(raw&&raw.version===1){
      state.institutions=(Array.isArray(raw.institutions)?raw.institutions:[]).map(cleanInstitution).filter(Boolean);
      state.classes=(Array.isArray(raw.classes)?raw.classes:[]).map(cleanMeeting).filter(Boolean);
    }else{
      var old=defaultState();state.institutions=old.institutions;state.classes=old.classes;
    }
    CATALOG.forEach(function(item){
      if(!state.institutions.some(function(existing){return norm(existing.name)===norm(item.name);}))state.institutions.push(cleanInstitution(item));
    });
  }
  function persist(){
    var saveStatus=$("save-status");
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,institutions:state.institutions,classes:state.classes}));
      if(saveStatus)saveStatus.textContent=t("savedOk");
    }catch(e){
      if(saveStatus)saveStatus.textContent=language==="es"?"No se pudo guardar en este navegador":"Could not save in this browser";
    }
  }
  function setMessage(text,success){
    var el=$("form-message");if(!el)return;
    el.textContent=text||"";el.classList.toggle("success",!!success);
  }
  function setInstitutionMessage(text,success){
    var el=$("institution-message");if(!el)return;
    el.textContent=text||"";el.classList.toggle("success",!!success);
  }
  function findInstitution(name){
    return state.institutions.find(function(item){return norm(item.name)===norm(name);})||null;
  }
  function setLanguage(){
    language=document.documentElement.lang==="en"?"en":"es";
    $("save-status").textContent=t("saved");
    populateDays();
    renderAll();
  }
  function populateDays(){
    var select=$("day-input"),old=select.value||"0";
    select.innerHTML="";
    DAYS.forEach(function(day){
      var option=document.createElement("option");option.value=String(day.id);option.textContent=day[language];select.appendChild(option);
    });
    select.value=old;
  }
  function populateInstitutions(){
    var list=$("institution-options");list.innerHTML="";
    state.institutions.slice().sort(function(a,b){return a.name.localeCompare(b.name);}).forEach(function(item){
      var option=document.createElement("option");option.value=item.name;
      option.label=item.code?(item.abbr+" · SNIES "+item.code):item.abbr;
      list.appendChild(option);
    });
  }
  function colorWash(hex,alpha){
    var n=parseInt(String(hex).slice(1),16);
    var r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    return "rgba("+r+","+g+","+b+","+alpha+")";
  }
  function logoNode(item){
    var outer=document.createElement("span");outer.className="agenda-directory-logo";
    outer.style.backgroundColor=colorWash(item.color,.12);outer.style.color=item.color;
    if(item.logo){
      var img=document.createElement("img");img.src=item.logo;img.alt="";img.loading="lazy";outer.appendChild(img);
    }else{outer.textContent=item.abbr||initials(item.name);}
    return outer;
  }
  function renderDirectory(){
    var list=$("directory-list"),empty=$("directory-empty");
    list.innerHTML="";
    var used={};
    state.classes.forEach(function(item){var inst=findInstitution(item.institution);if(inst)used[norm(inst.name)]=inst;});
    state.institutions.filter(function(item){return !item.code&&item.logo;}).forEach(function(item){used[norm(item.name)]=item;});
    var entries=Object.keys(used).map(function(key){return used[key];}).sort(function(a,b){return a.name.localeCompare(b.name);});
    empty.hidden=entries.length>0;
    entries.forEach(function(item){
      var li=document.createElement("li");li.className="agenda-directory-item";
      li.appendChild(logoNode(item));
      var body=document.createElement("span");body.className="agenda-directory-name";body.textContent=item.name;
      var code=document.createElement("span");code.className="agenda-directory-code";code.textContent=item.code?"SNIES "+item.code:(item.abbr||t("notAvailable"));
      body.appendChild(code);li.appendChild(body);list.appendChild(li);
    });
    populateInstitutions();
  }
  function sortedClasses(){
    return state.classes.slice().sort(function(a,b){return a.day-b.day||timeMinutes(a.start)-timeMinutes(b.start)||a.course.localeCompare(b.course);});
  }
  function meetingDetail(item){
    var day=DAYS[item.day][language];
    return day+" · "+fmtTime(item.start)+"–"+fmtTime(item.end)+(item.room?" · "+item.room:"");
  }
  function actionButton(label,action,item){
    var button=document.createElement("button");button.type="button";button.className="agenda-event-action";button.dataset.action=action;button.dataset.id=item.id;button.textContent=label;
    button.setAttribute("aria-label",(action==="edit"?t("edit"):t("remove"))+" · "+item.course+" · "+meetingDetail(item));
    return button;
  }
  function makeEvent(item,laneIndex,laneCount){
    var event=document.createElement("article");event.className="agenda-event";
    var minutes=timeMinutes(item.start)-HOUR_START*60,duration=timeMinutes(item.end)-timeMinutes(item.start);
    event.style.top=(minutes/60*HOUR_HEIGHT+2)+"px";
    event.style.height=Math.max(26,duration/60*HOUR_HEIGHT-3)+"px";
    event.style.left=(5+laneIndex*(90/laneCount))+"%";event.style.width=(90/laneCount)+"%";
    event.style.setProperty("--event-color",item.color);event.style.setProperty("--event-wash",colorWash(item.color,.14));
    if(duration<60)event.classList.add("compact");
    var title=document.createElement("strong");title.className="agenda-event-title";title.textContent=item.course;event.appendChild(title);
    var inst=findInstitution(item.institution),meta=document.createElement("span");meta.className="agenda-event-meta";
    meta.textContent=(inst?inst.abbr:item.institution)+" · "+fmtTime(item.start)+"–"+fmtTime(item.end)+(item.room?" · "+item.room:"");event.appendChild(meta);
    var actions=document.createElement("div");actions.className="agenda-event-actions";actions.appendChild(actionButton(t("edit"),"edit",item));actions.appendChild(actionButton(t("remove"),"delete",item));event.appendChild(actions);
    return event;
  }
  function renderCalendar(){
    var root=$("calendar-grid");root.innerHTML="";
    var blank=document.createElement("div");blank.className="agenda-day-head";blank.setAttribute("aria-hidden","true");root.appendChild(blank);
    DAYS.forEach(function(day){var h=document.createElement("div");h.className="agenda-day-head";h.textContent=day[language];root.appendChild(h);});
    var times=document.createElement("div");times.className="agenda-time-column";
    for(var hour=HOUR_START;hour<=HOUR_END;hour++){
      var label=document.createElement("span");label.className="agenda-time-label"+(hour===HOUR_START?" first":"");label.style.top=((hour-HOUR_START)*HOUR_HEIGHT)+"px";label.textContent=String(hour).padStart(2,"0")+":00";times.appendChild(label);
    }
    root.appendChild(times);
    var lanes=[];
    DAYS.forEach(function(day){
      var lane=document.createElement("div");lane.className="agenda-day-lane";lane.dataset.day=String(day.id);root.appendChild(lane);lanes.push(lane);
    });
    DAYS.forEach(function(day){
      var entries=state.classes.filter(function(item){return item.day===day.id;}).sort(function(a,b){return timeMinutes(a.start)-timeMinutes(b.start);});
      var laneEnds=[];
      entries.forEach(function(item){
        var laneIndex=laneEnds.findIndex(function(end){return end<=timeMinutes(item.start);});
        if(laneIndex<0){laneIndex=laneEnds.length;laneEnds.push(timeMinutes(item.end));}else{laneEnds[laneIndex]=timeMinutes(item.end);}
        item._laneIndex=laneIndex;
      });
      var laneCount=Math.max(1,laneEnds.length);
      entries.forEach(function(item){lanes[day.id].appendChild(makeEvent(item,item._laneIndex,laneCount));});
    });
    $("calendar-empty").hidden=state.classes.length>0;
  }
  function renderClassList(){
    var list=$("class-list"),count=$("class-count");list.innerHTML="";
    var entries=sortedClasses();
    count.textContent=String(entries.length);
    if(!entries.length){var empty=document.createElement("p");empty.className="agenda-no-class-list";empty.textContent=t("noClasses");list.appendChild(empty);return;}
    entries.forEach(function(item){
      var card=document.createElement("article");card.className="agenda-class-item";card.style.setProperty("--event-color",item.color);
      var color=document.createElement("span");color.className="agenda-class-color";card.appendChild(color);
      var body=document.createElement("div"),title=document.createElement("strong"),detail=document.createElement("div");
      body.className="agenda-class-copy";title.className="agenda-class-name";title.textContent=item.course;
      detail.className="agenda-class-detail";detail.textContent=item.institution+" · "+meetingDetail(item);
      body.appendChild(title);body.appendChild(detail);card.appendChild(body);
      var actions=document.createElement("div");actions.className="agenda-class-actions";actions.appendChild(actionButton(t("edit"),"edit",item));actions.appendChild(actionButton(t("remove"),"delete",item));card.appendChild(actions);
      list.appendChild(card);
    });
  }
  function renderAll(){renderDirectory();renderCalendar();renderClassList();}
  function persistAndRender(){persist();renderAll();}
  function resetForm(){
    $("meeting-form").reset();$("day-input").value="0";$("color-input").value="#3f7e73";
    editingId=null;$("submit-meeting").textContent=t("add");$("cancel-edit").hidden=true;setMessage("",false);
  }
  function startEdit(id){
    var item=state.classes.find(function(x){return x.id===id;});if(!item)return;
    editingId=id;$("institution-input").value=item.institution;$("course-input").value=item.course;$("day-input").value=String(item.day);
    $("start-input").value=item.start;$("end-input").value=item.end;$("room-input").value=item.room;$("color-input").value=item.color;
    $("submit-meeting").textContent=t("save");$("cancel-edit").hidden=false;setMessage("",false);
    $("course-input").focus();window.scrollTo({top:$("meeting-form").getBoundingClientRect().top+window.scrollY-100,behavior:"smooth"});
  }
  function removeMeeting(id){
    var item=state.classes.find(function(x){return x.id===id;});if(!item)return;
    state.classes=state.classes.filter(function(x){return x.id!==id;});
    if(editingId===id)resetForm();persistAndRender();
  }
  function handleAction(event){
    var button=event.target.closest("[data-action]");if(!button)return;
    var id=button.dataset.id;if(button.dataset.action==="edit")startEdit(id);else if(button.dataset.action==="delete")removeMeeting(id);
  }
  function addMeeting(event){
    event.preventDefault();
    var institution=$("institution-input").value.trim(),course=$("course-input").value.trim();
    var day=Number($("day-input").value),start=$("start-input").value,end=$("end-input").value,room=$("room-input").value.trim(),color=$("color-input").value;
    if(!institution||!course){setMessage(t("required"),false);return;}
    var sm=timeMinutes(start),em=timeMinutes(end);
    if(sm<HOUR_START*60||em>HOUR_END*60||em<=sm){setMessage(t("timeError"),false);return;}
    var clash=state.classes.find(function(item){return item.day===day&&item.id!==editingId&&sm<timeMinutes(item.end)&&em>timeMinutes(item.start);});
    if(clash){setMessage(t("overlap")+clash.course+t("overlapEnd"),false);return;}
    if(!findInstitution(institution)){
      state.institutions.push({name:institution,code:"",abbr:initials(institution),color:color,logo:""});
    }
    var meeting=cleanMeeting({id:editingId||makeId(),institution:institution,course:course,day:day,start:start,end:end,room:room,color:color});
    if(editingId)state.classes=state.classes.map(function(item){return item.id===editingId?meeting:item;});
    else state.classes.push(meeting);
    persistAndRender();resetForm();$("institution-input").value="";$("course-input").focus();
  }
  function getDialog(){return $("institution-dialog");}
  function openDialog(){var d=getDialog();if(d&&typeof d.showModal==="function")d.showModal();else if(d)d.setAttribute("open","");$("new-inst-name").focus();}
  function closeDialog(){var d=getDialog();if(d&&typeof d.close==="function")d.close();else if(d)d.removeAttribute("open");}
  function compressLogo(file){
    return new Promise(function(resolve,reject){
      if(!file){resolve("");return;}
      if(!file.type||file.type.indexOf("image/")!==0||file.size>3*1024*1024){reject(new Error(t("imageBad")));return;}
      var reader=new FileReader();
      reader.onerror=function(){reject(new Error(t("imageBad")));};
      reader.onload=function(){
        var img=new Image();
        img.onerror=function(){reject(new Error(t("imageBad")));};
        img.onload=function(){
          var scale=Math.min(1,256/Math.max(img.width,img.height)),canvas=document.createElement("canvas");
          canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
          var ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
          var data=canvas.toDataURL("image/webp",.88);resolve(data);
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function addInstitution(event){
    event.preventDefault();
    var name=$("new-inst-name").value.trim(),color=$("new-inst-color").value,file=$("new-inst-logo").files[0];
    if(!name)return;
    if(findInstitution(name)){setInstitutionMessage(t("dialogDuplicate"),false);return;}
    compressLogo(file).then(function(logo){
      state.institutions.push({name:name,code:"",abbr:initials(name),color:color,logo:logo});
      persistAndRender();$("institution-input").value=name;$("color-input").value=color;
      $("institution-form").reset();$("new-inst-color").value="#3f7e73";closeDialog();setInstitutionMessage("",false);
    }).catch(function(error){setInstitutionMessage(error.message||t("imageBad"),false);});
  }
  function exportBackup(){
    var payload={app:"Mi Agenda Docente Colombia",version:1,exportedAt:new Date().toISOString(),institutions:state.institutions,classes:state.classes};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="mi-agenda-docente-respaldo.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    $("save-status").textContent=t("exportDone");
  }
  function importBackup(file){
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(){
      try{
        var data=JSON.parse(String(reader.result||""));
        if(data.version!==1||!Array.isArray(data.classes)||!Array.isArray(data.institutions))throw new Error();
        state.institutions=data.institutions.map(cleanInstitution).filter(Boolean);
        CATALOG.forEach(function(item){if(!state.institutions.some(function(x){return norm(x.name)===norm(item.name);}))state.institutions.push(cleanInstitution(item));});
        state.classes=data.classes.map(cleanMeeting).filter(Boolean);
        persistAndRender();$("save-status").textContent=t("importOk");
      }catch(error){$("save-status").textContent=t("importBad");}
      $("import-file").value="";
    };
    reader.onerror=function(){$("save-status").textContent=t("importBad");$("import-file").value="";};
    reader.readAsText(file);
  }
  function clearClasses(){
    if(!state.classes.length)return;
    if(!window.confirm(t("clearConfirm")))return;
    state.classes=[];resetForm();persistAndRender();$("save-status").textContent=t("clearDone");
  }
  function bind(){
    $("meeting-form").addEventListener("submit",addMeeting);
    $("cancel-edit").addEventListener("click",resetForm);
    $("institution-input").addEventListener("change",function(){var inst=findInstitution(this.value);if(inst)$("color-input").value=inst.color||"#3f7e73";});
    $("open-institution-dialog").addEventListener("click",openDialog);
    $("open-institution-dialog-small").addEventListener("click",openDialog);
    $("institution-form").addEventListener("submit",addInstitution);
    $("export-button").addEventListener("click",exportBackup);
    $("print-button").addEventListener("click",function(){window.print();});
    $("import-file").addEventListener("change",function(){importBackup(this.files&&this.files[0]);});
    $("clear-button").addEventListener("click",clearClasses);
    $("calendar-grid").addEventListener("click",handleAction);
    $("class-list").addEventListener("click",handleAction);
    document.querySelectorAll("[data-lang-btn]").forEach(function(button){button.addEventListener("click",setLanguage);});
    $("institution-dialog").addEventListener("click",function(e){if(e.target===this)closeDialog();});
  }
  function ready(fn){if(document.readyState!=="loading")fn();else document.addEventListener("DOMContentLoaded",fn);}
  ready(function(){
    loadState();populateDays();populateInstitutions();bind();renderAll();setLanguage();
  });
})();
