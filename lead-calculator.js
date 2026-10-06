/* Exact final-state arithmetic. Physical reachability is deliberately a separate judgment. */
(function(root){
 const zones={N1:'Top',B1:'Top',N2:'Left',B2:'Right',MID:'MID',R1:'Left',N3:'Right',R2:'Down',N4:'Down'};
 const initialCounts={N1:[6,0,0],B1:[0,4,2],N2:[0,0,4],B2:[0,4,0],MID:[0,0,2],R1:[0,0,4],N3:[0,0,0],R2:[6,0,0],N4:[6,0,0]};
 function calculate(s){
  const rp=s.redPark,bp=s.bluePark,mid=rp>bp?'red':bp>rp?'blue':'neutral';
  let rc=0,bc=0,ry=0,by=0;const rows=[];
  for(const[id,zone]of Object.entries(zones)){
   const [r,b,y]=s.counts[id]||[0,0,0],owner=zone==='MID'?mid:s.toggles[zone];
   rc+=r;bc+=b;if(owner==='red')ry+=y;if(owner==='blue')by+=y;
   rows.push({id,owner,red:r*5+(owner==='red'?y*10:0),blue:b*5+(owner==='blue'?y*10:0)});
  }
  const auto=s.auto==='win'?[12,0]:s.auto==='loss'?[0,12]:[6,6];
  const red=rc*5+ry*10+rp*8+auto[0],blue=bc*5+by*10+bp*8+auto[1],margin=red-blue;
  const budget=s.budget===null?null:s.budget;
  const cushion=budget===null?null:margin-budget;
  const needed=budget===null?null:Math.max(0,Math.floor((budget-margin)/10)+1);
  return{red,blue,margin,cushion,needed,mid,rc,bc,ry,by,auto,rows};
 }
 root.OverrideScore={calculate,initialCounts,zones};
 if(typeof module!=='undefined')module.exports=root.OverrideScore;
 if(typeof document==='undefined')return;
 const host=document.getElementById('lead-calculator');if(!host)return;
 let state={counts:JSON.parse(JSON.stringify(initialCounts)),toggles:{Left:'neutral',Down:'red',Top:'blue',Right:'blue'},auto:'win',redPark:0,bluePark:2,budget:null};
 const option=(v,label)=>`<option value="${v}">${label}</option>`;
 host.innerHTML=`<div class="board-tools"><button data-preset="neutral">Our yellows neutralized</button><button data-preset="hold">Left retained</button><button data-preset="stolen">Left stolen</button></div><figure><div data-board="counted-lead" data-calculator></div><figcaption>R / B / Y = visible red, blue and yellow halves on that goal. These are count labels, not physical pin illustrations. Toggle colors show the selected final state. This example can be a conservative envelope; it does not prove all actions fit into one finish.</figcaption></figure><div class="inputs"><label>Auto result for red<select id="auto">${option('win','Won (+12 margin)')+option('tie','Tied (0 margin)')+option('loss','Lost (−12 margin)')}</select></label><label>Extra danger beyond this finish (points)<input id="budget" type="number" min="0" step="1" placeholder="Unknown — enter an allowance"></label><label>Red robots ending in MID<select id="redPark">${[0,1,2].map(n=>option(n,n)).join('')}</select></label><label>Blue robots ending in MID<select id="bluePark">${[0,1,2].map(n=>option(n,n)).join('')}</select></label>${['Left','Down','Top','Right'].map(z=>`<label>${z} final toggle<select data-zone="${z}">${option('red','Red')+option('neutral','Neutral / touching')+option('blue','Blue')}</select></label>`).join('')}</div><p id="mid-owner" class="subtle"></p><div class="table-wrap"><table><thead><tr><th>Goal</th><th>Red halves</th><th>Blue halves</th><th>Yellow halves</th><th>Red points</th><th>Blue points</th></tr></thead><tbody>${Object.entries(state.counts).map(([g,a])=>`<tr><th scope="row">${g}</th>${a.map((v,i)=>`<td><input type="number" min="0" max="100" step="1" required value="${v}" data-goal="${g}" data-index="${i}" aria-label="${g} ${['red','blue','yellow'][i]} visible halves"></td>`).join('')}<td data-red="${g}"></td><td data-blue="${g}"></td></tr>`).join('')}</tbody></table></div><p class="subtle">This editor does not enforce field inventory, stack geometry or robot reach. Count visible halves from a real position when using it for match planning.</p><div class="score" aria-live="polite"><div class="red">Red finish<strong id="red-total"></strong></div><div class="blue">Blue finish<strong id="blue-total"></strong></div></div><p id="breakdown"></p><div class="notice" role="status"><strong id="margin"></strong><p id="verdict"></p><p id="need"></p></div>`;
 const board=OverrideField.mount(host.querySelector('[data-board]'),{counts:state.counts,toggles:state.toggles,robots:[['10102C','red',11,60],['Red-1','red',66,12],['Blue 1','blue',55,68],['Blue 2','blue',82,83]],context(){return {auto:state.auto,redPark:state.redPark,bluePark:state.bluePark,extraDanger:state.budget,score:calculate(state)};},onToggle(z,c){state.toggles[z]=c;update();},onReset(){state.toggles={Left:'neutral',Down:'red',Top:'blue',Right:'blue'};update();}});
 function update(){
  if(host.querySelector('input:invalid')){host.querySelector('#red-total').textContent='—';host.querySelector('#blue-total').textContent='—';host.querySelector('#margin').textContent='Check the highlighted inputs.';host.querySelector('#verdict').textContent='Enter valid whole-number counts. The diagram keeps the last valid counts until these inputs are corrected.';host.querySelector('#need').textContent='';host.querySelector('#breakdown').textContent='Totals unavailable while an input is invalid.';return;}
  const r=calculate(state);board.update(state.counts,state.toggles);
  host.querySelectorAll('[data-zone]').forEach(s=>s.value=state.toggles[s.dataset.zone]);
  for(const id of['auto','redPark','bluePark'])host.querySelector('#'+id).value=state[id];
  host.querySelector('#mid-owner').textContent='MID yellow owner: '+r.mid+'. Derived from the MID robot counts above.';
  for(const row of r.rows){host.querySelector(`[data-red="${row.id}"]`).textContent=row.red;host.querySelector(`[data-blue="${row.id}"]`).textContent=row.blue;}
  host.querySelector('#red-total').textContent=r.red;host.querySelector('#blue-total').textContent=r.blue;
  host.querySelector('#breakdown').textContent=`Red: ${r.rc*5} color + ${r.ry*10} yellow + ${state.redPark*8} MID robots + ${r.auto[0]} auto. Blue: ${r.bc*5} color + ${r.by*10} yellow + ${state.bluePark*8} MID robots + ${r.auto[1]} auto.`;
  host.querySelector('#margin').textContent=`Selected finish: ${r.margin>0?'red ahead by '+r.margin:r.margin<0?'red behind by '+(-r.margin):'tied'} points.`;
  host.querySelector('#verdict').textContent=r.cushion===null?'Remaining danger is unknown. This is a finish score, not a secure-lead verdict.':r.cushion>0?`After the ${state.budget}-point allowance, ${r.cushion} points remain. Safe only under these inputs and reachable defensive assumptions.`:r.cushion===0?`The ${state.budget}-point allowance consumes the whole lead. A tie is not a secured win.`:`The ${state.budget}-point allowance leaves a ${-r.cushion}-point shortfall. This finish does not cover the chosen danger.`;
  host.querySelector('#need').textContent=r.needed===null?'Set an allowance to calculate the additional retained yellow halves needed.':r.needed===0?'No extra retained yellow halves are required by this arithmetic.':`At least ${r.needed} additional visible yellow ${r.needed===1?'half':'halves'} retained by red would cover this gap. Adding them to a neutral/blue-owned area does not meet that requirement.`;
 }
 host.querySelectorAll('[data-goal]').forEach(input=>input.oninput=()=>{const n=Number(input.value);if(input.value===''||!Number.isInteger(n)||n<0||n>100){input.setCustomValidity('Enter a whole number from 0 to 100.');update();return;}input.setCustomValidity('');state.counts[input.dataset.goal][+input.dataset.index]=n;update();});
 host.querySelectorAll('[data-zone]').forEach(s=>s.onchange=()=>{state.toggles[s.dataset.zone]=s.value;update();});
 for(const id of['auto','redPark','bluePark'])host.querySelector('#'+id).onchange=e=>{state[id]=id==='auto'?e.target.value:+e.target.value;update();};
 host.querySelector('#budget').oninput=e=>{const n=Number(e.target.value);if(e.target.value!==''&&(!Number.isInteger(n)||n<0)){e.target.setCustomValidity('Use zero or a positive whole-point allowance.');update();return;}e.target.setCustomValidity('');state.budget=e.target.value===''?null:n;update();};
 host.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state.toggles.Left={neutral:'neutral',hold:'red',stolen:'blue'}[b.dataset.preset];update();});
 update();
})(typeof window!=='undefined'?window:globalThis);
