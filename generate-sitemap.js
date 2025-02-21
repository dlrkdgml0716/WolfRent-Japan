const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

// 사이트의 기본 URL
const hostname = 'https://wolfrent.netlify.app';

// sitemap에 포함할 페이지 정보 배열
const pages = [
  { url: '/', priority: 1.00 },
  { url: '/남친대행', priority: 0.90 },
  { url: '/렌탈남친', priority: 0.90 },
  { url: '/애인대행', priority: 0.80 },
  { url: '/한국렌탈남친', priority: 0.60 },
  { url: '/역할대행', priority: 0.80 },
  { url: '/blog.rss', priority: 0.70 }
];

// HTML 파일 및 sitemap.xml 파일이 있는 디렉터리 설정
const publicDir = path.join('C:', 'workspace', 'Wolf Rent');

// 각 페이지의 마지막 수정 시간을 파일 시스템에서 읽어와 lastmod 값 추가
pages.forEach(page => {
  let fileName;
  if (page.url === '/') {
    fileName = 'index.html';
  } else if (page.url.endsWith('.rss')) {
    fileName = 'blog.rss';
  } else {
    fileName = page.url.substring(1) + '.html';
  }

  const filePath = path.join(publicDir, fileName);
  try {
    const stats = fs.statSync(filePath);
    page.lastmod = stats.mtime.toISOString(); // 수정 시간 가져오기
  } catch (err) {
    console.error(`파일을 찾을 수 없습니다: ${filePath}`, err);
    page.lastmod = new Date().toISOString(); // 파일 없을 시 현재 시간으로 대체
  }
});

// SitemapStream을 사용하여 sitemap 생성
const sitemapStream = new SitemapStream({ hostname });

// 각 페이지 정보를 sitemapStream에 기록
pages.forEach(page => {
  sitemapStream.write(page);
});
sitemapStream.end();

// 생성된 sitemap 데이터를 파일로 저장
const sitemapPath = path.join(publicDir, 'sitemap.xml');
streamToPromise(sitemapStream)
  .then(sm => {
    fs.writeFileSync(sitemapPath, sm); // sitemap.xml 파일 저장
    console.log('sitemap.xml 파일이 성공적으로 생성되었습니다:', sitemapPath);
  })
  .catch(err => {
    console.error('sitemap 생성 중 에러 발생:', err);
  });
