/* Applies the saved theme before first paint (render-blocking on purpose, loaded in <head>).
 * Kept out of index.html so the page CSP can use script-src 'self' without 'unsafe-inline'. */
try{let s=localStorage.getItem('amb-ui-prefs-v2');let p=s?JSON.parse(s):{};document.documentElement.dataset.nuiTheme=p.theme||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');if(p.motion===false)document.documentElement.classList.add('nui-motion-off');}catch{document.documentElement.dataset.nuiTheme='light';}
