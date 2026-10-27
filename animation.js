// Decorative video only. This player never calls the shadow game API.
export function setupShadowAnimation(root, control) {
  const video=root.querySelector('video'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,manualPause=false,explicitMotion=false,modal=false,blocked=false;
  function label(){
    if(!control)return;
    const active=!video.paused;
    control.textContent=active?'Приостановить анимацию':'Включить анимацию';
    control.setAttribute('aria-pressed',String(active));
  }
  function sync(){
    const motion=explicitMotion||(!reduced.matches&&document.documentElement.dataset.motion!=='off');
    const play=visible&&!document.hidden&&!manualPause&&!modal&&motion;
    if(!play){video.pause();label();return;}
    if(blocked)return;
    if(!video.getAttribute('src'))video.src=video.canPlayType('video/mp4; codecs="avc1.64001f"')?video.dataset.src:video.dataset.webm;
    video.play().then(label).catch(()=>{blocked=true;label();});
  }
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible&&video.dataset.poster&&!video.poster)video.poster=video.dataset.poster;
    sync();
  },{threshold:.05});
  observer.observe(root);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{explicitMotion=false;sync();});
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  video.addEventListener('play',label);video.addEventListener('pause',label);
  video.addEventListener('error',()=>{blocked=true;label();});
  if(control)control.onclick=()=>{
    if(video.paused){manualPause=false;explicitMotion=true;blocked=false;}
    else manualPause=true;
    sync();
  };
  return {setModal(value){modal=value;sync();}};
}

setupShadowAnimation(document.getElementById('shadow-demo'), document.getElementById('shadow-motion'));
