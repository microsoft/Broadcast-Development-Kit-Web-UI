export const extractLinks = (rawHTML: string): string[] => {

  const doc = document.createElement('html');
  doc.innerHTML = rawHTML;
  const links = doc.getElementsByTagName('a')
  const urls = [];

  for (let i = 0; i < links.length; i++) {
    urls.push(links[i].getAttribute('href'));
  }

  return urls.filter(Boolean) as string[];
};
