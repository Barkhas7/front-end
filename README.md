
---

## 3. `frontend-app` README.md

```md
# frontend-app

SOA Lab 06-ийн энгийн frontend application.

## Товч тайлбар
Энэхүү frontend нь SOAP authentication service болон JSON profile service-тэй холбогдож ажиллана.

## Хуудаснууд
- `register.html` — хэрэглэгч бүртгүүлэх
- `login.html` — хэрэглэгч нэвтрэх
- `profile.html` — профайл үүсгэх, харах, шинэчлэх, устгах

## Ашигласан технологи
- HTML
- CSS
- JavaScript

## Файлууд
- `register.html`
- `login.html`
- `profile.html`
- `style.css`
- `app.js`

## Ажиллах логик
1. Хэрэглэгч `register.html` дээр бүртгүүлнэ.
2. `login.html` дээр нэвтэрч token авна.
3. Token нь `localStorage`-д хадгалагдана.
4. `profile.html` дээр JSON service-ийн CRUD үйлдлүүдийг ашиглана.
5. JSON service нь token-ийг SOAP service-ээр шалгана.

## Backend services
Frontend ажиллахын тулд дараах 2 service асаалттай байх шаардлагатай:

### SOAP Service
- `http://localhost:8081/auth`
- `http://localhost:8081/auth?wsdl`

### JSON Service
- `http://localhost:8082/users`

## Ажиллуулах заавар
1. `user-soap-service`-ээ асаана.
2. `user-json-service`-ээ асаана.
3. `register.html` эсвэл `login.html` файлыг browser дээр нээнэ.
4. Бүртгүүлж, нэвтэрч, профайл CRUD үйлдлүүдийг ашиглана.

## Тайлбар
Энэхүү frontend нь лабораторийн шаардлагад нийцсэн энгийн UI бөгөөд authentication болон profile management урсгалыг харуулдаг.
