import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gallery from '../views/Gallery.vue'
import Artists from '../views/Artists.vue'
import ArtDetail from '../views/ArtDetail.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/gallery', name: 'gallery', component: Gallery },
        { path: '/curators', name: 'artists', component: Artists },
        { path: '/gallery/:id', name: 'art-detail', component: ArtDetail, props: true },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

export default router
