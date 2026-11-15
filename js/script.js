document.addEventListener('DOMContentLoaded', () => {

    // Уведомление Cookie
    const cookieNotification = document.querySelector('#cookie-notifications');
    const cookieAccept = document.querySelector('.cookie__accept');
    const cookieDecline = document.querySelector('.cookie__decline');
    const cookieSettingsToggle = document.querySelector('.cookie__settings--toggle');
    const cookiePreferences = document.querySelector('#cookie-preferences');
    const cookieSave = document.querySelector('.cookie__save');

    const cookieAnalytics = document.querySelector('#cookie-analytics');
    const cookieMarketing = document.querySelector('#cookie-marketing');

    // Версия системы согласия
    const COOKIE_CONSENT_VERSION = '1.0';

    // Ключ хранения настроек в localStorage
    const COOKIE_STORAGE_KEY = 'cookieConsent';


    // Получение сохранённого согласия
    const getCookieConsent = () => {

        try {

            const savedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);

            if (!savedConsent) return null;

            const consent = JSON.parse(savedConsent);

            // Проверка версии системы согласия
            if (
                !consent ||
                consent.version !== COOKIE_CONSENT_VERSION
            ) {
                return null;
            }

            return {
                necessary: true,
                analytics: consent.analytics === true,
                marketing: consent.marketing === true,
                version: consent.version,
                updatedAt: consent.updatedAt
            };

        } catch (error) {

            console.warn(
                'Не удалось прочитать настройки Cookie:',
                error
            );

            return null;
        }
    };


    // Сохранение согласия
    const saveCookieConsent = (analytics, marketing) => {

        const consent = {
            necessary: true,
            analytics: analytics === true,
            marketing: marketing === true,
            version: COOKIE_CONSENT_VERSION,
            updatedAt: new Date().toISOString()
        };

        try {

            localStorage.setItem(
                COOKIE_STORAGE_KEY,
                JSON.stringify(consent)
            );

            return true;

        } catch (error) {

            console.warn(
                'Не удалось сохранить настройки Cookie:',
                error
            );

            return false;
        }
    };


    // Закрытие дополнительных настроек
    const closeCookiePreferences = () => {

        if (cookiePreferences) {
            cookiePreferences.hidden = true;
        }

        cookieSettingsToggle?.setAttribute(
            'aria-expanded',
            'false'
        );
    };


    // Скрытие уведомления
    const hideCookieNotification = () => {

        if (!cookieNotification) return;

        closeCookiePreferences();

        cookieNotification.hidden = true;
    };


    // Отображение уведомления
    const showCookieNotification = () => {

        if (!cookieNotification) return;

        cookieNotification.hidden = false;
    };


    // Восстановление ранее сохранённых настроек
    const restoreCookiePreferences = (consent) => {

        if (cookieAnalytics) {
            cookieAnalytics.checked = consent?.analytics === true;
        }

        if (cookieMarketing) {
            cookieMarketing.checked = consent?.marketing === true;
        }
    };


    // Проверка ранее сохранённого согласия
    const savedCookieConsent = getCookieConsent();

    restoreCookiePreferences(savedCookieConsent);

    if (savedCookieConsent) {

        hideCookieNotification();

    } else {

        showCookieNotification();
    }


    // Принять все категории Cookie
    cookieAccept?.addEventListener('click', () => {

        const saved = saveCookieConsent(true, true);

        if (saved) {

            restoreCookiePreferences({
                analytics: true,
                marketing: true
            });

            hideCookieNotification();
        }
    });


    // Отклонить необязательные категории Cookie
    cookieDecline?.addEventListener('click', () => {

        const saved = saveCookieConsent(false, false);

        if (saved) {

            restoreCookiePreferences({
                analytics: false,
                marketing: false
            });

            hideCookieNotification();
        }
    });


    // Открытие и закрытие дополнительных настроек
    cookieSettingsToggle?.addEventListener('click', () => {

        if (!cookiePreferences) return;

        const isExpanded =
            cookieSettingsToggle.getAttribute('aria-expanded') === 'true';

        // Изменение состояния панели
        cookiePreferences.hidden = isExpanded;

        cookieSettingsToggle.setAttribute(
            'aria-expanded',
            String(!isExpanded)
        );

        // Перемещение фокуса на аналитические настройки
        if (!isExpanded) {

            cookieAnalytics?.focus();
        }
    });


    // Сохранение индивидуальных настроек Cookie
    cookieSave?.addEventListener('click', () => {

        const analyticsEnabled = cookieAnalytics?.checked ?? false;
        const marketingEnabled = cookieMarketing?.checked ?? false;

        const saved = saveCookieConsent(
            analyticsEnabled,
            marketingEnabled
        );

        if (saved) {

            hideCookieNotification();
        }
    });

    // Модальное окно выбора города
    const openBtn = document.querySelector('.city__selector');
    const modalOverlay = document.getElementById('city-modal');
    const modalWindow = modalOverlay?.querySelector('.modal__city');
    const closeBtn = document.querySelector('.modal__city--close');
    const cityLinks = document.querySelectorAll('.modal__city--link');
    const cityList = document.querySelector('.modal__city--list');
    const cityNameSpan = document.querySelector('.city__name');
    const searchInput = document.querySelector('.modal__city--input');

    let selectedCity = localStorage.getItem('selectedCity');
    let previousFocus = null;
    let previousOverflow = '';
    let backgroundElements = [];


    // Настройка доступности модального окна
    if (modalOverlay && modalWindow) {

        modalWindow.setAttribute('role', 'dialog');
        modalWindow.setAttribute('aria-modal', 'true');
        modalWindow.setAttribute('aria-labelledby', 'city-modal-title');

        modalOverlay.setAttribute('aria-hidden', 'true');

        const modalTitle = modalOverlay.querySelector('.modal__city--title');

        if (modalTitle) {
            modalTitle.id = 'city-modal-title';
        }

        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Поиск города');
        }

        if (cityList) {
            cityList.setAttribute('aria-label', 'Список городов');
        }

        if (openBtn) {
            openBtn.setAttribute('aria-haspopup', 'dialog');
            openBtn.setAttribute('aria-expanded', 'false');
            openBtn.setAttribute('aria-controls', 'city-modal');
        }
    }


    // Восстановление ранее выбранного города
    if (selectedCity) {

        if (cityNameSpan) {
            cityNameSpan.textContent = selectedCity;
        }

        cityLinks.forEach(link => {

            link.classList.toggle(
                'modal__city--link-active',
                link.textContent.trim() === selectedCity
            );
        });
    }


    // Получение видимых городов
    const getVisibleCityLinks = () => {

        return Array.from(cityLinks).filter(link => {

            const item = link.closest('.modal__city--item');

            return item && item.style.display !== 'none';
        });
    };


    // Подсветка активного города
    const setActiveCity = (link) => {

        cityLinks.forEach(cityLink => {

            cityLink.classList.toggle(
                'modal__city--link-active',
                cityLink === link
            );
        });
    };


    // Сброс фильтров поиска
    const resetFilters = () => {

        const items = document.querySelectorAll('.modal__city--item');

        items.forEach(item => {
            item.style.display = '';
        });

        cityLinks.forEach(link => {

            link.classList.toggle(
                'modal__city--link-active',
                link.textContent.trim() === selectedCity
            );
        });
    };


    // Блокировка фона модального окна
    const lockBackground = () => {

        previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        backgroundElements = Array.from(
            modalOverlay.parentElement.children
        )
        .filter(element => element !== modalOverlay)
        .map(element => ({

            element: element,
            inert: element.inert,
            ariaHidden: element.getAttribute('aria-hidden')

        }));

        backgroundElements.forEach(({ element }) => {

            element.inert = true;
        });
    };


    // Восстановление фона
    const unlockBackground = () => {

        document.body.style.overflow = previousOverflow;

        backgroundElements.forEach(({ element, inert }) => {

            element.inert = inert;
        });

        backgroundElements.forEach(({ element, ariaHidden }) => {

            if (ariaHidden === null) {

                element.removeAttribute('aria-hidden');

            } else {

                element.setAttribute('aria-hidden', ariaHidden);
            }
        });

        backgroundElements = [];
    };


    // Открытие модального окна
    const openModal = () => {

        if (!modalOverlay || !modalWindow) return;

        previousFocus = document.activeElement;

        modalOverlay.classList.add('modal__overlay--active');
        modalOverlay.setAttribute('aria-hidden', 'false');

        openBtn?.setAttribute('aria-expanded', 'true');

        lockBackground();

        if (searchInput) {

            searchInput.value = '';

            resetFilters();
        }

        // Перемещение фокуса на поиск
        requestAnimationFrame(() => {

            searchInput?.focus();
        });
    };


    // Закрытие модального окна
    const closeModal = () => {

        if (!modalOverlay) return;

        modalOverlay.classList.remove('modal__overlay--active');
        modalOverlay.setAttribute('aria-hidden', 'true');

        openBtn?.setAttribute('aria-expanded', 'false');

        unlockBackground();

        // Возврат фокуса на элемент открытия
        if (previousFocus && previousFocus.isConnected) {

            previousFocus.focus();
        }
    };


    // Открытие по кнопке выбора города
    if (openBtn && modalOverlay) {

        openBtn.addEventListener('click', openModal);

        // Закрытие по кнопке
        closeBtn?.addEventListener('click', closeModal);

        // Закрытие при клике вне окна
        modalOverlay.addEventListener('click', (e) => {

            if (e.target === modalOverlay) {

                closeModal();
            }
        });
    }


    // Выбор города
    const selectCity = (link) => {

        if (!link) return;

        selectedCity = link.textContent.trim();

        // Сохранение выбранного города
        localStorage.setItem('selectedCity', selectedCity);

        // Отображение города в шапке
        if (cityNameSpan) {

            cityNameSpan.textContent = selectedCity;
        }

        // Обновление активного города
        setActiveCity(link);

        closeModal();
    };


    // Обработчики выбора города
    cityLinks.forEach(link => {

        link.addEventListener('click', (e) => {

            e.preventDefault();

            selectCity(link);
        });
    });


    // Живой поиск городов
    if (searchInput) {

        searchInput.addEventListener('input', function() {

            const query = this.value.toLowerCase().trim();

            const items = document.querySelectorAll('.modal__city--item');

            let visibleCount = 0;
            let lastVisibleLink = null;

            items.forEach(item => {

                const link = item.querySelector('.modal__city--link');

                if (!link) return;

                const cityName = link.textContent.toLowerCase();

                if (cityName.includes(query)) {

                    item.style.display = '';

                    visibleCount++;

                    lastVisibleLink = link;

                } else {

                    item.style.display = 'none';
                }
            });

            // Подсветка единственного найденного города
            if (visibleCount === 1 && query !== '') {

                setActiveCity(lastVisibleLink);

            } else {

                setActiveCity(null);
            }
        });


        // Управление поиском с клавиатуры
        searchInput.addEventListener('keydown', (e) => {

            const visibleLinks = getVisibleCityLinks();

            // ArrowDown — переход к первому результату
            if (e.key === 'ArrowDown') {

                e.preventDefault();

                visibleLinks[0]?.focus();
            }

            // Enter — выбор города
            if (e.key === 'Enter') {

                e.preventDefault();

                if (visibleLinks.length === 0) return;

                const query = searchInput.value.trim();

                // При пустом поиске выбираем ранее выбранный город
                if (query === '' && selectedCity) {

                    const selectedLink = visibleLinks.find(link => {

                        return link.textContent.trim() === selectedCity;
                    });

                    if (selectedLink) {

                        selectCity(selectedLink);

                        return;
                    }
                }

                // При поиске выбираем первый найденный город
                if (query !== '') {

                    selectCity(visibleLinks[0]);
                }
            }
        });
    }


    // Навигация по городам с клавиатуры
    if (cityList) {

        cityList.addEventListener('keydown', (e) => {

            const visibleLinks = getVisibleCityLinks();

            const currentIndex = visibleLinks.indexOf(
                document.activeElement
            );

            if (currentIndex === -1 || visibleLinks.length === 0) return;

            let nextIndex = currentIndex;

            switch (e.key) {

                case 'ArrowDown':

                    e.preventDefault();

                    nextIndex = (currentIndex + 1) % visibleLinks.length;

                    break;

                case 'ArrowUp':

                    e.preventDefault();

                    nextIndex = (
                        currentIndex - 1 + visibleLinks.length
                    ) % visibleLinks.length;

                    break;

                case 'Home':

                    e.preventDefault();

                    nextIndex = 0;

                    break;

                case 'End':

                    e.preventDefault();

                    nextIndex = visibleLinks.length - 1;

                    break;

                default:

                    return;
            }

            visibleLinks[nextIndex].focus();
        });
    }


    // Закрытие по Escape и ограничение Tab-навигации
    document.addEventListener('keydown', (e) => {

        if (
            !modalOverlay ||
            !modalWindow ||
            !modalOverlay.classList.contains('modal__overlay--active')
        ) {
            return;
        }

        // Escape — закрытие окна
        if (e.key === 'Escape') {

            e.preventDefault();

            closeModal();

            return;
        }

        // Tab — управление фокусом внутри окна
        if (e.key === 'Tab') {

            const focusableElements = Array.from(
                modalWindow.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(element => {

                return element.getClientRects().length > 0;
            });

            if (focusableElements.length === 0) {

                e.preventDefault();

                return;
            }

            const firstElement = focusableElements[0];

            const lastElement = focusableElements[
                focusableElements.length - 1
            ];

            // Если фокус оказался вне окна
            if (!modalWindow.contains(document.activeElement)) {

                e.preventDefault();

                firstElement.focus();

                return;
            }

            // Shift + Tab с первого элемента
            if (
                e.shiftKey &&
                document.activeElement === firstElement
            ) {

                e.preventDefault();

                lastElement.focus();
            }

            // Tab с последнего элемента
            else if (
                !e.shiftKey &&
                document.activeElement === lastElement
            ) {

                e.preventDefault();

                firstElement.focus();
            }
        }
    });


    // Модальное окно "Заказать звонок"
    const callbackOverlay = document.getElementById('callback-modal');
    const callbackWindow = callbackOverlay?.querySelector('.modal__callback');

    const callbackClose = document.getElementById('callback-close');
    const callbackForm = document.getElementById('callback-form');

    const callbackName = callbackForm?.querySelector(
        '.modal__callback--input:not(.modal__callback--input-phone)'
    );

    const callbackPhone = callbackForm?.querySelector(
        '.modal__callback--input-phone'
    );

    let callbackPreviousFocus = null;
    let callbackPreviousOverflow = '';
    let callbackBackgroundElements = [];


    // Настройка доступности модального окна
    if (callbackOverlay && callbackWindow) {

        callbackWindow.setAttribute('role', 'dialog');
        callbackWindow.setAttribute('aria-modal', 'true');
        callbackWindow.setAttribute(
            'aria-labelledby',
            'callback-modal-title'
        );

        callbackOverlay.setAttribute('aria-hidden', 'true');

        const callbackTitle = callbackOverlay.querySelector(
            '.modal__callback--title'
        );

        if (callbackTitle) {
            callbackTitle.id = 'callback-modal-title';
        }

        if (callbackName) {
            callbackName.setAttribute('aria-label', 'Ваше имя');
        }

        if (callbackPhone) {

            callbackPhone.setAttribute('aria-label', 'Номер телефона');

            // Мобильная цифровая клавиатура
            callbackPhone.setAttribute('inputmode', 'numeric');

            // Не более 10 цифр после +7
            callbackPhone.setAttribute('maxlength', '10');

            callbackPhone.setAttribute('autocomplete', 'tel-national');
        }
    }


    // Блокировка фона модального окна
    const lockCallbackBackground = () => {

        callbackPreviousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        callbackBackgroundElements = Array.from(
            callbackOverlay.parentElement.children
        )
        .filter(element => element !== callbackOverlay)
        .map(element => ({

            element: element,
            inert: element.inert,
            ariaHidden: element.getAttribute('aria-hidden')

        }));

        callbackBackgroundElements.forEach(({ element }) => {

            element.inert = true;
        });
    };


    // Восстановление фона
    const unlockCallbackBackground = () => {

        document.body.style.overflow = callbackPreviousOverflow;

        callbackBackgroundElements.forEach(({ element, inert }) => {

            element.inert = inert;
        });

        callbackBackgroundElements.forEach(({ element, ariaHidden }) => {

            if (ariaHidden === null) {

                element.removeAttribute('aria-hidden');

            } else {

                element.setAttribute('aria-hidden', ariaHidden);
            }
        });

        callbackBackgroundElements = [];
    };


    // Открытие модального окна "Заказать звонок"
    const openCallbackModal = () => {

        if (!callbackOverlay || !callbackWindow) return;

        callbackPreviousFocus = document.activeElement;

        callbackOverlay.hidden = false;

        callbackOverlay.classList.add('modal__overlay--active');

        callbackOverlay.setAttribute('aria-hidden', 'false');

        lockCallbackBackground();

        // Перемещение фокуса на поле имени
        requestAnimationFrame(() => {

            callbackName?.focus();
        });
    };


    // Закрытие модального окна «Заказать звонок»
    const closeCallbackModal = () => {

        if (
            !callbackOverlay ||
            callbackOverlay.hidden
        ) {
            return;
        }

        callbackOverlay.classList.remove('modal__overlay--active');

        callbackOverlay.setAttribute('aria-hidden', 'true');

        callbackOverlay.hidden = true;

        unlockCallbackBackground();

        // Возврат фокуса на предыдущий элемент
        if (
            callbackPreviousFocus &&
            callbackPreviousFocus.isConnected
        ) {

            callbackPreviousFocus.focus();
        }

        callbackPreviousFocus = null;
    };


    // Закрытие по кнопке
    callbackClose?.addEventListener('click', closeCallbackModal);


    // Закрытие нажатием за пределами окна
    callbackOverlay?.addEventListener('click', (e) => {

        if (e.target === callbackOverlay) {

            closeCallbackModal();
        }
    });

    // Проверка номера телефона

    if (callbackPhone) {

        callbackPhone.addEventListener('input', () => {

            // Удаление всех символов, кроме цифр
            callbackPhone.value = callbackPhone.value
                .replace(/\D/g, '')
                .slice(0, 10);
        });
    }


    // Обработка отправки формы

    callbackForm?.addEventListener('submit', (e) => {

        // Пока серверная отправка не реализована,
        // предотвращаем перезагрузку страницы
        e.preventDefault();
    });


    // Управление модальным окном с клавиатуры

    document.addEventListener('keydown', (e) => {

        if (
            !callbackOverlay ||
            !callbackWindow ||
            callbackOverlay.hidden
        ) {
            return;
        }

        // Escape — закрытие окна
        if (e.key === 'Escape') {

            e.preventDefault();

            closeCallbackModal();

            return;
        }

        // Tab — ограничение перехода фокуса внутри окна
        if (e.key === 'Tab') {

            const focusableElements = Array.from(
                callbackWindow.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(element => {

                return element.getClientRects().length > 0;
            });

            if (focusableElements.length === 0) {

                e.preventDefault();

                return;
            }

            const firstElement = focusableElements[0];

            const lastElement = focusableElements[
                focusableElements.length - 1
            ];

            // Если фокус оказался вне окна
            if (!callbackWindow.contains(document.activeElement)) {

                e.preventDefault();

                firstElement.focus();

                return;
            }

            // Shift + Tab с первого элемента
            if (
                e.shiftKey &&
                document.activeElement === firstElement
            ) {

                e.preventDefault();

                lastElement.focus();
            }

            // Tab с последнего элемента
            else if (
                !e.shiftKey &&
                document.activeElement === lastElement
            ) {

                e.preventDefault();

                firstElement.focus();
            }
        }
    });


    // Мобильное меню "Еще"
    const moreBtn = document.querySelector('.top__bar--more-btn');
    const rightMenu = document.querySelector('.top__bar--right');
    const navMenu = document.querySelector('.top__bar--nav');
    const topBarLeft = document.querySelector('.top__bar--left');

    if (moreBtn && rightMenu && navMenu && topBarLeft) {

        const originalParent = navMenu.parentNode;
        const originalNextSibling = navMenu.nextSibling;

        const mobileMedia = window.matchMedia(
            '(min-width: 320px) and (max-width: 480px)'
        );


        // Открытие мобильного меню
        const openMenu = () => {

            rightMenu.classList.add('top__bar--right-active');

            moreBtn.setAttribute('aria-expanded', 'true');
        };


        // Закрытие мобильного меню
        const closeMenu = () => {

            rightMenu.classList.remove('top__bar--right-active');

            moreBtn.setAttribute('aria-expanded', 'false');
        };


        // Перемещение навигации в зависимости от ширины экрана
        const updateMenuPosition = () => {

            if (mobileMedia.matches) {

                if (navMenu.parentNode !== rightMenu) {

                    rightMenu.appendChild(navMenu);
                }

            } else {

                closeMenu();

                if (navMenu.parentNode !== originalParent) {

                    if (originalNextSibling) {

                        originalParent.insertBefore(
                            navMenu,
                            originalNextSibling
                        );

                    } else {

                        originalParent.appendChild(navMenu);
                    }
                }
            }
        };


        // Первоначальная настройка положения меню
        moreBtn.setAttribute('aria-expanded', 'false');

        updateMenuPosition();


        // Отслеживание изменения ширины экрана
        if (mobileMedia.addEventListener) {

            mobileMedia.addEventListener(
                'change',
                updateMenuPosition
            );

        } else {

            mobileMedia.addListener(updateMenuPosition);
        }


        // Открытие и закрытие меню по кнопке
        moreBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            if (
                rightMenu.classList.contains('top__bar--right-active')
            ) {

                closeMenu();

            } else {

                openMenu();
            }
        });


        // Закрытие после выбора ссылки
        rightMenu.addEventListener('click', (e) => {

            if (e.target.closest('a')) {

                closeMenu();
            }
        });


        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {

            if (
                !rightMenu.contains(e.target) &&
                !moreBtn.contains(e.target)
            ) {

                closeMenu();
            }
        });


        // Закрытие клавишей Escape
        document.addEventListener('keydown', (e) => {

            if (e.key === 'Escape') {

                closeMenu();
            }
        });
    }


    // Слайдер баннера
    const bannerSlider = document.querySelector('.banner__slider');

    if (bannerSlider) {

        const bannerTrack = bannerSlider.querySelector('.banner__slides');
        const bannerSlides = Array.from(
            bannerTrack.querySelectorAll('.banner__slide')
        );

        const bannerPrevBtn = bannerSlider.querySelector('.banner__arrow--left');
        const bannerNextBtn = bannerSlider.querySelector('.banner__arrow--right');
        const bannerDots = bannerSlider.querySelectorAll('.banner__dot');

        // Настройки слайдера
        const AUTOPLAY_DELAY = 3000;
        const SWIPE_THRESHOLD = 50;

        if (bannerSlides.length > 0) {

            // Начальный активный слайд
            let currentBannerSlide = bannerSlides.findIndex(slide =>
                slide.classList.contains('banner__slide--active')
            );

            if (currentBannerSlide === -1) {
                currentBannerSlide = 0;
            }

            // Клоны для бесконечного переключения
            const firstClone = bannerSlides[0].cloneNode(true);
            const lastClone = bannerSlides[bannerSlides.length - 1].cloneNode(true);

            firstClone.classList.remove('banner__slide--active');
            lastClone.classList.remove('banner__slide--active');

            bannerTrack.prepend(lastClone);
            bannerTrack.append(firstClone);

            // Позиция трека с учётом клонированных слайдов
            let trackPosition = currentBannerSlide + 1;

            let autoplayTimer = null;
            let isDragging = false;
            let isPointerDown = false;
            let startX = 0;
            let startY = 0;
            let dragDistance = 0;
            let startTranslate = 0;
            let pointerId = null;

            // Ширина одного слайда
            function getBannerSlideWidth() {
                return bannerSlider.clientWidth;
            }

            // Установка положения трека
            function setBannerTrackPosition(animate = true) {

                bannerTrack.style.transition = animate
                    ? 'transform 0.4s ease'
                    : 'none';

                const offset = -trackPosition * getBannerSlideWidth();

                bannerTrack.style.transform =
                    `translate3d(${offset}px, 0, 0)`;

            }

            // Обновление точек
            function updateBannerDots() {

                bannerDots.forEach((dot, index) => {

                    dot.classList.toggle(
                        'banner__dot--active',
                        index === currentBannerSlide
                    );

                    dot.setAttribute(
                        'aria-current',
                        index === currentBannerSlide ? 'true' : 'false'
                    );

                });

            }

            // Переключение на конкретный слайд
            function showBannerSlide(index) {

                currentBannerSlide =
                    (index + bannerSlides.length) % bannerSlides.length;

                trackPosition = currentBannerSlide + 1;

                setBannerTrackPosition();
                updateBannerDots();

            }

            // Следующий слайд
            function nextBannerSlide() {

                if (currentBannerSlide === bannerSlides.length - 1) {

                    currentBannerSlide = 0;
                    trackPosition = bannerSlides.length + 1;

                } else {

                    currentBannerSlide++;
                    trackPosition++;

                }

                setBannerTrackPosition();
                updateBannerDots();

            }

            // Предыдущий слайд
            function prevBannerSlide() {

                if (currentBannerSlide === 0) {

                    currentBannerSlide = bannerSlides.length - 1;
                    trackPosition = 0;

                } else {

                    currentBannerSlide--;
                    trackPosition--;

                }

                setBannerTrackPosition();
                updateBannerDots();

            }

            // Обработка окончания анимации
            bannerTrack.addEventListener('transitionend', (event) => {

                if (event.target !== bannerTrack) return;

                // Переход с клона последнего слайда на настоящий последний
                if (trackPosition === 0) {

                    trackPosition = bannerSlides.length;

                    setBannerTrackPosition(false);

                }

                // Переход с клона первого слайда на настоящий первый
                if (trackPosition === bannerSlides.length + 1) {

                    trackPosition = 1;

                    setBannerTrackPosition(false);

                }

            });

            // Остановка автопрокрутки
            function stopBannerAutoplay() {

                if (autoplayTimer !== null) {
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                }

            }

            // Запуск автопрокрутки
            function startBannerAutoplay() {

                stopBannerAutoplay();

                if (bannerSlides.length < 2 || document.hidden) return;

                autoplayTimer = setInterval(() => {
                    nextBannerSlide();
                }, AUTOPLAY_DELAY);

            }

            // Перезапуск автопрокрутки
            function restartBannerAutoplay() {
                startBannerAutoplay();
            }

            // Стрелка назад
            bannerPrevBtn?.addEventListener('click', () => {

                prevBannerSlide();
                restartBannerAutoplay();

            });

            // Стрелка вперёд
            bannerNextBtn?.addEventListener('click', () => {

                nextBannerSlide();
                restartBannerAutoplay();

            });

            // Переключение по точкам
            bannerDots.forEach((dot, index) => {

                dot.addEventListener('click', () => {

                    showBannerSlide(index);
                    restartBannerAutoplay();

                });

            });

            // Остановка автопрокрутки при наведении
            bannerSlider.addEventListener('mouseenter', stopBannerAutoplay);
            bannerSlider.addEventListener('mouseleave', startBannerAutoplay);

            // Учитываем видимость вкладки
            document.addEventListener('visibilitychange', () => {

                if (document.hidden) {
                    stopBannerAutoplay();
                } else {
                    startBannerAutoplay();
                }

            });

            // Начало перетаскивания мышью или пальцем
            bannerTrack.addEventListener('pointerdown', (event) => {

                // Для мыши используем только левую кнопку
                if (event.pointerType === 'mouse' && event.button !== 0) return;

                // Не начинаем перетаскивание с интерактивных элементов
                if (event.target.closest('button, a, input, textarea, select')) return;

                isPointerDown = true;
                isDragging = false;

                pointerId = event.pointerId;

                startX = event.clientX;
                startY = event.clientY;

                dragDistance = 0;

                startTranslate = -trackPosition * getBannerSlideWidth();

                stopBannerAutoplay();

                bannerTrack.style.transition = 'none';

                bannerTrack.setPointerCapture(event.pointerId);

            });

            // Перемещение слайда
            bannerTrack.addEventListener('pointermove', (event) => {

                if (!isPointerDown || event.pointerId !== pointerId) return;

                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;

                // Определяем горизонтальное движение
                if (!isDragging) {

                    if (
                        Math.abs(deltaX) < 5 ||
                        Math.abs(deltaX) <= Math.abs(deltaY)
                    ) {
                        return;
                    }

                    isDragging = true;

                }

                dragDistance = deltaX;

                const newTranslate = startTranslate + deltaX;

                bannerTrack.style.transform =
                    `translate3d(${newTranslate}px, 0, 0)`;

            });

            // Завершение перетаскивания
            function finishBannerDrag(event) {

                if (!isPointerDown) return;

                if (
                    event &&
                    pointerId !== null &&
                    event.pointerId !== pointerId
                ) {
                    return;
                }

                isPointerDown = false;

                if (isDragging) {

                    if (dragDistance < -SWIPE_THRESHOLD) {
                        nextBannerSlide();
                    } else if (dragDistance > SWIPE_THRESHOLD) {
                        prevBannerSlide();
                    } else {
                        setBannerTrackPosition();
                    }

                } else {

                    setBannerTrackPosition();

                }

                isDragging = false;
                pointerId = null;

                restartBannerAutoplay();

            }

            bannerTrack.addEventListener('pointerup', finishBannerDrag);
            bannerTrack.addEventListener('pointercancel', finishBannerDrag);

            bannerTrack.addEventListener('lostpointercapture', () => {

                if (isPointerDown) {
                    finishBannerDrag();
                }

            });

            // Пересчёт положения при изменении размера окна
            window.addEventListener('resize', () => {
                setBannerTrackPosition(false);
            });

            // Первоначальная настройка
            setBannerTrackPosition(false);
            updateBannerDots();

            startBannerAutoplay();

        }

    }

    // Слайдер услуг
    const servicesSlider = document.querySelector('.services__slider');

    if (servicesSlider) {

        const servicesSlides = servicesSlider.querySelector('.services__slides');
        const servicesTrack = servicesSlider.querySelector('.services__track');
        const servicesCards = servicesSlider.querySelectorAll('.services__slide');

        const servicesPrevBtn = servicesSlider.querySelector('.services__arrow--left');
        const servicesNextBtn = servicesSlider.querySelector('.services__arrow--right');

        if (servicesSlides && servicesTrack && servicesCards.length && servicesPrevBtn && servicesNextBtn) {

            let currentServicesSlide = 0;

            // Шаг перемещения одной карточки
            const getServicesStep = () => {
                const cardWidth = servicesCards[0].getBoundingClientRect().width;
                const gap = parseFloat(getComputedStyle(servicesTrack).gap) || 0;

                return cardWidth + gap;
            };

            // Максимальное смещение трека
            const getMaxServicesOffset = () => {
                return Math.max(0, servicesTrack.scrollWidth - servicesSlides.clientWidth);
            };

            // Обновление слайдера
            const updateServicesSlider = () => {

                const step = getServicesStep();
                const maxOffset = getMaxServicesOffset();

                const offset = Math.min(currentServicesSlide * step, maxOffset);

                servicesTrack.style.transform = `translateX(-${offset}px)`;

                servicesPrevBtn.disabled = offset <= 1;
                servicesNextBtn.disabled = offset >= maxOffset - 1;
            };

            // Следующая карточка
            servicesNextBtn.addEventListener('click', () => {

                const maxOffset = getMaxServicesOffset();
                const nextOffset = (currentServicesSlide + 1) * getServicesStep();

                if (nextOffset < maxOffset - 1) {
                    currentServicesSlide++;
                } else {
                    currentServicesSlide = Math.ceil(maxOffset / getServicesStep());
                }

                updateServicesSlider();
            });

            // Предыдущая карточка
            servicesPrevBtn.addEventListener('click', () => {

                if (currentServicesSlide > 0) {
                    currentServicesSlide--;
                }

                updateServicesSlider();
            });

            // Пересчёт при изменении размера окна
            window.addEventListener('resize', () => {
                currentServicesSlide = 0;
                updateServicesSlider();
            });

            // Первоначальная настройка
            updateServicesSlider();
        }
    }

    // Фильтрация и кнопка "Показать еще"
    const filterBtns = document.querySelectorAll('.products__filter-btn');
    const productCards = document.querySelectorAll('.products__card');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const productsGrid = document.querySelector('.products__grid');
    const moreWrapper = document.querySelector('.products__more');

    // Функция для применения фильтра
    function applyFilter(filterValue) {
        // Сброс кнопки "Показать еще" в исходное состояние при смене фильтра
        productsGrid.classList.remove('products__grid--all-visible');
        if (loadMoreBtn) loadMoreBtn.textContent = 'Показать еще';

        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const isHidden = card.classList.contains('products__card--hidden');

            // Если выбран фильтр "Все"
            if (filterValue === 'all') {
                // Скрытые карточки (9, 10) показ только если нажата "Показать еще"
                if (isHidden) {
                    card.style.display = 'none'; // Скрытие (ждем клика по кнопке)
                } else {
                    card.style.display = 'flex'; // Показ обычных
                }
            } 
            // Если выбран фильтр "Акции"
            else if (filterValue === 'sale') {
                // Показ всех карточек с акцией, даже если они скрытые
                if (category === 'sale') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            }
        });

        // Управление видимостью кнопки "Показать еще"
        if (moreWrapper) {
            if (filterValue === 'sale') {
                // Если выбраны акции, кнопка не нужна (все акции уже показаны)
                moreWrapper.style.display = 'none';
            } else {
                // Если выбрано "Все", кнопка нужна
                moreWrapper.style.display = 'flex';
            }
        }
    }

    // Обработчик клика по кнопкам фильтра
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Меняется активный класс
                filterBtns.forEach(b => b.classList.remove('products__filter-btn--active'));
                btn.classList.add('products__filter-btn--active');

                // Применяется фильтр
                const filterValue = btn.getAttribute('data-filter');
                applyFilter(filterValue);
            });
        });
    }

    // Обработчик клика по кнопке "Показать еще"
    if (loadMoreBtn && productsGrid) {
        loadMoreBtn.addEventListener('click', () => {
            const isAllVisible = productsGrid.classList.contains('products__grid--all-visible');

            if (isAllVisible) {
                productsGrid.classList.remove('products__grid--all-visible');
                loadMoreBtn.textContent = 'Показать еще';
                // Скрытие карточки
                productCards.forEach(card => {
                    if (card.classList.contains('products__card--hidden')) {
                        card.style.display = 'none';
                    }
                });
            } else {
                productsGrid.classList.add('products__grid--all-visible');
                loadMoreBtn.textContent = 'Скрыть все';
                // Показ скрытой карточки
                productCards.forEach(card => {
                    if (card.classList.contains('products__card--hidden')) {
                        card.style.display = 'flex';
                    }
                });
            }
        });
    }

    // Выпадающее меню "Каталог"
    const catalogBtn = document.getElementById('catalogBtn');
    const catalogDropdown = document.getElementById('catalogDropdown');

    if (catalogBtn && catalogDropdown) {
        // Открытие/закрытие по клику на кнопку
        catalogBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Чтобы клик не улетал на документ
            catalogDropdown.classList.toggle('is-active');
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!catalogDropdown.contains(e.target) && e.target !== catalogBtn) {
                catalogDropdown.classList.remove('is-active');
            }
        });

        // Закрытие при клике на ссылку внутри меню (если нужно)
        const catalogLinks = catalogDropdown.querySelectorAll('.header__catalog-link');
        catalogLinks.forEach(link => {
            link.addEventListener('click', () => {
                catalogDropdown.classList.remove('is-active');
            });
        });
    }

    // Кнопка "Наверх"
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        // Показ/скрытие кнопки при скролле
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('is-visible');
            } else {
                scrollTopBtn.classList.remove('is-visible');
            }
        });

        // Плавный скролл наверх при клике
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});