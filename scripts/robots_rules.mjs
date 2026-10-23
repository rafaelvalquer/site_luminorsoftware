function groupsFromRobots(text) {
  const groups=[];
  let agents=[];
  let rules=[];
  let sawRule=false;
  const finish=()=>{if(agents.length)groups.push({agents,rules});agents=[];rules=[];sawRule=false};
  for(const raw of text.split(/\r?\n/)){
    const line=raw.split('#',1)[0].trim();
    if(!line)continue;
    const agent=line.match(/^user-agent\s*:\s*(.+)$/i);
    if(agent){if(sawRule)finish();agents.push(agent[1].trim().toLowerCase());continue}
    const rule=line.match(/^(allow|disallow)\s*:\s*(.*)$/i);
    if(rule&&agents.length){sawRule=true;const path=rule[2].trim();if(path)rules.push({allow:rule[1].toLowerCase()==='allow',path})}
  }
  finish();
  return groups;
}

function matchesRule(rulePath,path){
  const anchored=rulePath.endsWith('$');
  const source=anchored?rulePath.slice(0,-1):rulePath;
  const pattern=source.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*');
  return new RegExp(`^${pattern}${anchored?'$':''}`).test(path);
}

export function isAllowedByRobots(text,url,userAgent='Googlebot'){
  const groups=groupsFromRobots(text);
  const agent=userAgent.toLowerCase();
  const exact=groups.filter(group=>group.agents.some(value=>value!=='*'&&agent.includes(value)));
  const selected=exact.length?exact:groups.filter(group=>group.agents.includes('*'));
  const path=new URL(url).pathname+new URL(url).search;
  const matched=selected.flatMap(group=>group.rules).filter(rule=>matchesRule(rule.path,path));
  if(!matched.length)return true;
  const specificity=rule=>rule.path.replaceAll('*','').replace(/\$$/,'').length;
  const longest=Math.max(...matched.map(specificity));
  return matched.filter(rule=>specificity(rule)===longest).some(rule=>rule.allow);
}
