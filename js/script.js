
document.addEventListener('DOMContentLoaded', () => {

    // Модальное окно выбора города
    const openBtn = document.querySelector('.city__selector');
    const modalOverlay = document.getElementById('city-modal');
    const closeBtn = document.querySelector('.modal__city--close');
    const cityLinks = document.querySelectorAll('.modal__city--link');
    const cityNameSpan = document.querySelector('.city__name');
    const searchInput = document.querySelector('.modal__city--input');

    let selectedCity = localStorage.getItem('selectedCity');

    // Восстановление ранее выбранного города
    if (selectedCity) {
        if (cityNameSpan) {
            cityNameSpan.textContent = selectedCity;
        }

        cityLinks.forEach(link => {
            if (link.textContent.trim() === selectedCity) {
                link.classList.add('modal__city--link-active');
            }
        });
    }

    if (openBtn && modalOverlay) {

        // Открытие модального окна
        openBtn.addEventListener('click', () => {
            modalOverlay.classList.add('modal__overlay--active');
            document.body.style.overflow = 'hidden';

            if (searchInput) {
                searchInput.value = '';
                resetFilters();
            }

            // Восстановление активного города
            cityLinks.forEach(link => {
                link.classList.toggle(
                    'modal__city--link-active',
                    link.textContent.trim() === selectedCity
                );
            });
        });

        // Закрытие модального окна
        const closeModal = () => {
            modalOverlay.classList.remove('modal__overlay--active');
            document.body.style.overflow = '';
        };

        // Кнопка закрытия
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Закрытие при клике вне окна
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Выбор города
        cityLinks.forEach(link => {

            link.addEventListener('click', function(e) {
                e.preventDefault();

                selectedCity = this.textContent.trim();

                // Сохранение выбранного города
                localStorage.setItem('selectedCity', selectedCity);

                // Отображение города в шапке
                if (cityNameSpan) {
                    cityNameSpan.textContent = selectedCity;
                }

                // Обновление активного города
                cityLinks.forEach(l => {
                    l.classList.remove('modal__city--link-active');
                });

                this.classList.add('modal__city--link-active');

                closeModal();
            });
        });

        // Живой поиск городов
        if (searchInput) {

            searchInput.addEventListener('input', function() {

                const query = this.value.toLowerCase().trim();
                const items = document.querySelectorAll('.modal__city--item');

                cityLinks.forEach(link => {
                    link.classList.remove('modal__city--link-active');
                });

                let visibleCount = 0;
                let lastVisibleLink = null;

                items.forEach(item => {

                    const link = item.querySelector('.modal__city--link');

                    if (!link) return;

                    const cityName = link.textContent.toLowerCase();

                    if (cityName.includes(query)) {
                        item.style.display = 'block';
                        visibleCount++;
                        lastVisibleLink = link;
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Подсветка единственного найденного города
                if (visibleCount === 1 && query !== '') {
                    lastVisibleLink.classList.add('modal__city--link-active');
                }
            });

            // Выбор города клавишей Enter
            searchInput.addEventListener('keydown', function(e) {

                if (e.key === 'Enter') {

                    e.preventDefault();

                    const activeLink = document.querySelector(
                        '.modal__city--link-active'
                    );

                    if (activeLink) {
                        activeLink.click();
                    }
                }
            });
        }

        // Сброс фильтров поиска
        function resetFilters() {

            const items = document.querySelectorAll('.modal__city--item');

            items.forEach(item => {
                item.style.display = 'block';
            });

            cityLinks.forEach(link => {
                link.classList.remove('modal__city--link-active');
            });
        }
    }

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

        const openMenu = () => {
            rightMenu.classList.add('top__bar--right-active');
            moreBtn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            rightMenu.classList.remove('top__bar--right-active');
            moreBtn.setAttribute('aria-expanded', 'false');
        };

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

        updateMenuPosition();

        if (mobileMedia.addEventListener) {
            mobileMedia.addEventListener('change', updateMenuPosition);
        } else {
            mobileMedia.addListener(updateMenuPosition);
        }

        moreBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            if (rightMenu.classList.contains('top__bar--right-active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        rightMenu.addEventListener('click', (e) => {

            if (e.target.closest('a')) {
                closeMenu();
            }
        });

        document.addEventListener('click', (e) => {

            if (
                !rightMenu.contains(e.target) &&
                !moreBtn.contains(e.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {

            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }

});