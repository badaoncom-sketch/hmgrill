# 메뉴 이미지 사용 안내

메뉴 이미지는 정적 자산으로 `public/images/menu/`에 저장한다.

예시:

```text
public/images/menu/signature-grill.webp
public/images/menu/family-set.webp
```

관리자 메뉴관리의 `이미지 경로`에는 `public`을 제외한 경로를 입력한다.

예시:

```text
/images/menu/signature-grill.webp
/images/menu/family-set.webp
```

현재 추가된 파일:

```text
/images/menu/1783221304773.png
/images/menu/1783221304868.png
/images/menu/1783221304957.png
/images/menu/1783221305035.png
/images/menu/1783221305136.png
/images/menu/1783221305205.png
/images/menu/1783221305281.png
/images/menu/1783221305383.png
/images/menu/1783221305470.png
/images/menu/1783221305545.png
```

운영 권장:

- 파일명은 가능하면 메뉴명을 알아볼 수 있는 영문 소문자로 변경한다.
- 배포 용량을 줄이기 위해 PNG보다 WebP를 우선 사용한다.
- 외부 URL 대신 `/images/menu/...` 형태의 로컬 정적 경로를 사용한다.
