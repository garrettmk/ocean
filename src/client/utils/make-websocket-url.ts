
// Take a regular http/https url and change it to ws/wss
export function makeWebsocketUrl(url: string) : string {
  const wsUrl = new URL(url);
  const isSecure = ['wss', 'https'].includes(wsUrl.protocol);
  
  if (isSecure)
    wsUrl.protocol = 'wss';
  else
    wsUrl.protocol = 'ws';

  return wsUrl.toString();
}