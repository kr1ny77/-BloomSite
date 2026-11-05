# Bloom · проверка редизайна

4 ноября 2026. Реализация завершена локально; итоговый Go-сервер: http://localhost:8096/ . Публикация и настройки аудитории не менялись.

## Что изменилось
Крупная оригинальная эмблема + Pacifico на первом экране, осмысленный зелёный свет, два согласованных цветовых режима, выразительное native-dialog меню с визуальными previews, разные композиции разделов, новый оригинальный food still life, sticky reading path и ограниченный desktop scrollytelling. Сохранены содержательные продуктовые ограничения, якоря, названия основной навигации, исходные Keynote-экраны и заглушки магазинов. Удалены принудительная остановка wheel и мёртвая фотоглавная логика.

## Фактически проверено
- Рабочий Go-шаблон открыт в браузере. HTML/медиа также проверялись через локальный файловый preview во время правок, затем запущен новый Go-процесс с итоговыми встроенными файлами.
- Desktop1280×720; фактическая iframe-вёрстка1440×900; mobile390×680 и390×844; no-JS320×680. Ограничение инструмента: viewport override не применялся к основному окну, поэтому адаптация проверена в одноимённом тестовом документе с заданной настоящей шириной iframe. Масштабировалась только его внешняя презентация, media queries внутри получали фактические320/390/1440px.
- Нет горизонтального overflow: измерены html.clientWidth==html.scrollWidth для320px без JS и1440px, а также desktop document.scrollWidth==innerWidth.
- Первый экран, шапка, меню, фотографии, два app-screen состояния, источники, missing-data state, финал и обе темы осмотрены.
- Меню: pointer click на компьютере и в узкой вёрстке, Enter, Escape, переход к разделу и перенос фокуса, aria-expanded, закрытие/разблокировка body, focus restoration. Дополнительно проверен Tab с последнего пункта обратно на кнопку закрытия; добавлен явный boundary guard поверх native modal поведения. Крупные кнопки и ссылки доступны для касания. Физический телефон не подключался.
- Нативные якорные ссылки и раскрытие Источника работают при реально отключённых скриптах (sandbox без allow-scripts). Все разделы, оба экрана и предупреждения остаются в документе.
- Forward/reverse scroll осмотрен. При включённом desktop движении изменяются transform дочерних изображений; контейнер остаётся в обычном потоке. Ошибка возможной пустой полосы у фотографии исправлена завершением на xPercent0.
- Reduced motion проверен unit-тестами и отдельным desktop Lighthouse/Chromium-сеансом с --force-prefers-reduced-motion=reduce: запросов gsap.min.js/ScrollTrigger.min.js нет. В CSS отключено пространственное движение; меню остаётся доступным.
- В итоговом обычном browser-сеансе console errors/warnings: отсутствуют. Все наблюдаемые изображения загружены. Проверены локальные ссылки ассетов, destinations всех якорей, alt и геометрические атрибуты изображений.
- App Store / Google Play остаются aria-disabled placeholders с «Скоро», без выдуманных адресов. Оценки явно демонстрационные; неподтверждённые партнёры/исследования/отзывы/даты не добавлены.

## Автоматические проверки
PASS: go test ./..., go vet ./..., 10Node regression tests, focused Oxlint (четыре авторских JS, build script и изменённые тесты), JavaScript syntax, npm run build. Проверка ассетов/якорей/alt/dimensions и отсутствия em-dash/en-dash в разметке прошла.
Полный lint неиспользуемого React scaffold не выполнялся; он не является производственным сайтом.

## Lighthouse
Лабораторные локальные показатели, не полевые Core Web Vitals и не гарантия скорости внешнего хостинга. INP требует полевого измерения; в лаборатории записан TBT.

- mobile: {"categories": {"performance": 99, "accessibility": 100, "best-practices": 100, "seo": 100, "agentic-browsing": 100}, "LCP": "2.1 s", "CLS": "0", "TBT": "0 ms"}
- desktop: {"categories": {"performance": 100, "accessibility": 100, "best-practices": 100, "seo": 100, "agentic-browsing": 100}, "LCP": "0.7 s", "CLS": "0.001", "TBT": "0 ms"}
- reduced: {"categories": {"performance": 100, "accessibility": 100, "best-practices": 100, "seo": 100, "agentic-browsing": 100}, "LCP": "0.5 s", "CLS": "0", "TBT": "0 ms"}

Исходные JSON: lighthouse-redesign-mobile.json, lighthouse-redesign-desktop.json, lighthouse-redesign-reduced.json. Первоначальный mobile91 улучшен до99 за счёт responsive WebP, уменьшенной эмблемы, subset Onest и отсутствия desktop engine на телефоне. Размер нового фото:97KB desktop/27KB mobile; emblem320px≈7KB; Onest≈41KB. Преобразования сохраняют исходные пользовательские материалы.

## Референсы и материалы
Главный ориентир после уточнения пользователя: https://en.manayerbamate.com/ . Дополнительные: https://egirltime.com/ ; https://www.awwwards.com/sites/opal-tadpole ; https://www.awwwards.com/sites/igloo-inc . Просмотрены обе заданные премиальные подборки. Конкретные принципы и ограничения live-версий записаны в REDESIGN.md. Текущий Opal редиректит на другой сайт; исходная версия изучена по архиву Awwwards. Live Igloo показывал загрузку WebGL, поэтому его непроверенные взаимодействия не заявляются.
Bloom-Keynote-v6.key: изучены встроенные девять preview-слайдов и оригинальные материалы. Эмблема, Pacifico, outline и реальные экраны сохранены. Натюрморт сгенерирован для Bloom, внешняя графика референсов не копировалась.

## Ограничения
Физические touch-устройства и экранный диктор не проверялись. Phone layout и действия проверялись в браузере, корректность семантики дополнительно проверена Lighthouse. Одобренного финального ролика нет: статичная композиция полностью готова, opt-in integration и fail-safe пути протестированы, художественное качество будущего ролика потребует отдельной проверки. Реальные store links, методика, подтверждённые источники и дата запуска по-прежнему не предоставлены.

## AI SLOP CLEANUP REPORT
Scope: templates/index.html, static/css/style.css, четыре авторских JS, связанные regression tests и документация.
Behavior Lock: baseline Go tests и15Node tests прошли до правок; obsolete wheel contract явно заменён требованием свободной прокрутки; final10tests покрывают готовую/неодобренную/ошибочную анимацию, reduced motion, последовательный optional loader и переключение экранов.
Cleanup Plan: сохранение исходного состояния; классификация fail-safe; удаление dead chapter code; единый CSS token layer; устранение transform ownership conflict; targeted regression verification; independent read-only review.
Fallback Findings: no-JS document, blocked autoplay/media error, reduced-motion static rendering и optional-engine failure являются grounded compatibility/fail-safe; все данные сохраняются, неожиданные ошибки сообщаются. Masking fallbacks не добавлены. Архитектурной эскалации не потребовалось.
UI/Design Findings: повторяющиеся полноэкранные фотослайды заменены разным ритмом; случайные декорации/ложные цифры не добавлены; градиент мотивирован фирменным листом.
Passes Completed: fallback gate; dead-code deletion; duplication removal; naming/error handling; test reinforcement. Writer/reviewer separation: независимый code-reviewer проверил6файлов; найденные дефекты исправлены (layout при playing, transform ownership, no-JS header, lint promise, image pan overscan).
Quality Gates: Regression/Focused Lint/Go vet/Build PASS. Standalone React typecheck N/A (inactive scaffold). Static asset/product checks PASS. Отдельный security scanner N/A для визуальной правки статичного сайта.
Changed Files: HTML меняет композиции, CSS заменяет накопленные overrides единым набором правил; app.js навигация/тема/focus; intro.js opt-in integration; motion.js responsive optional GSAP; presentation.js сохраняет экранный switch и удаляет dead chapter branch. Исходные obsolete файлы сохранены в docs/redesign-before, в production не входят.
Remaining Risks: физические устройства, финальный фильм и проверенные внешние продуктовые материалы перечислены выше.

## Сохранённые снимки и итоговый запуск
redesign-hero-desktop.jpg, redesign-hero-light.jpg, redesign-hero-mobile.jpg, redesign-menu-desktop.jpg и redesign-closing-light.jpg. Проверка source/Go: HTML совпадает после штатного удаления template-комментариев; CSS/app.js/motion.js совпадают побайтно. Временный responsive QA fixture удалён. Full-page screenshot экспорт инструментом менял высоту viewport и искажал dvh, поэтому такой снимок удалён; использовались снимки отдельных фактических видов. Итоговая страница оставлена открытой в браузере.
