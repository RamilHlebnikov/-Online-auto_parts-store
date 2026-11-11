
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

    // Мобильное меню «Ещё»

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

});