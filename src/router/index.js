import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gallery from '../views/Gallery.vue'
import Artists from '../views/Artists.vue'
import ArtDetail from '../views/ArtDetail.vue'
import ArtistDetail from '../views/ArtistDetail.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/gallery', name: 'gallery', component: Gallery },
        { path: '/curators', name: 'artists', component: Artists },
        { path: '/curators/:name', name: 'artist-detail', component: ArtistDetail },
        { path: '/gallery/:id', name: 'art-detail', component: ArtDetail, props: true },
        // Admin Routes
        { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLogin.vue') },
        { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboard.vue') },
        { path: '/admin/artworks', name: 'admin-artworks', component: () => import('../views/admin/ArtManager.vue') }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

export default router
