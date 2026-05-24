// Apply dark mode class before React hydrates to prevent flash
if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
}
