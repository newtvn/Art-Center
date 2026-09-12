import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
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
        { path: '/artists', alias: '/curators', name: 'artists', component: Artists },
        { path: '/artists/:name', alias: '/curators/:name', name: 'artist-detail', component: ArtistDetail },
        { path: '/gallery/:id', name: 'art-detail', component: ArtDetail, props: true },
        { path: '/:pathMatch(.*)*', redirect: '/gallery' },
        { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
        // Admin Routes
        { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLogin.vue') },
        { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboard.vue') },
        { path: '/admin/artworks', name: 'admin-artworks', component: () => import('../views/admin/ArtManager.vue') },
        { path: '/admin/profile', name: 'admin-profile', component: () => import('../views/admin/ProfileEditor.vue') }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

router.beforeEach(async to => {
    if (!to.path.startsWith('/admin/') || to.path === '/admin/login') return
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) return { path: '/admin/login', query: { next: to.path } }
    } catch { return { path: '/admin/login', query: { next: to.path } } }
})

export default router
