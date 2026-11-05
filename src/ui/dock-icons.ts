export function dockIcon(id:string):string{
 const paths:Record<string,string>={
  map:'<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="11" opacity=".4"/><path d="M24 3v6m0 30v6M3 24h6m30 0h6M30 18l-4 12-8-4 4-12Z"/><path d="m24 24 6-6"/>',
  heroes:'<path d="m12 6 25 29-4 4L8 10Zm24 0L11 35l4 4L40 10ZM8 30l11 10M29 40l11-10M6 43l6-7m24 0 6 7"/><path d="m24 15 8 4v9l-8 7-8-7v-9Z" fill="var(--dock-deep)"/>',
  gear:'<path d="m10 10 9-5 14 9-7 9-8-4-7 6-5-5Zm16 13 15 16-5 5-15-17M8 37l5-6m-6 6h10l4 7H3Z"/><path d="m32 7 7 2 3 8-5 5-6-1-4 5-5-5 5-5-1-6Z"/>',
  growth:'<path d="M24 43V24m0 8L12 20m12 9 12-13M12 20l-6-7 6-7 6 7Zm24-4-6-7 6-6 6 6ZM24 24l-7-8 7-8 7 8ZM14 43h20"/><circle cx="24" cy="38" r="3"/>'
 };
 return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]??paths.map}</svg>`;
}
