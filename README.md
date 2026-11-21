# 월간 서아

가상 브랜드 디자이너 **정서아**의 개인 포트폴리오입니다. 인물, 작업, 후기, 연락처는 모두 허구의 더미 데이터이며 실존 브랜드와 무관합니다.

English: a fictional Korean portfolio. Static files, no build step, no accounts, no stored messages.

Live site (after merge to `main`): https://xkarmfn2-art.github.io

## 로컬에서 보기

`index.html`을 브라우저로 열거나 루트에서 정적 서버를 띄웁니다.

```bash
python3 -m http.server 8080
```

## 구성

- `index.html` — 한 페이지. 히어로, 룩북(분류·검색), 후기, 연락
- `styles.css`, `main.js` — 빌드 없음
- `404.html` — 없는 경로
- `.nojekyll` — GitHub Pages가 Jekyll로 가공하지 않음

연락 폼은 서버로 보내지 않습니다. 입력값을 보여주는 동시에 `mailto:`로 메일 앱만 엽니다.

GitHub Pages 소스: 브랜치 `main`, 폴더 `/` (루트).
