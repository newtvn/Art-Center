import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import gsap from 'gsap'

const app = createApp(App)

// Custom Directive for Scroll Animations
app.directive('reveal', {
    mounted(el, binding) {
        const options = binding.value || {};

        gsap.set(el, {
            y: options.y || 50,
            opacity: 0,
            scale: options.scale || 1
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.to(el, {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: 'power3.out',
                        delay: options.delay || 0,
                        stagger: options.stagger || 0
                    });
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.15 });

        observer.observe(el);
    }
});

app.use(router).mount('#app')
