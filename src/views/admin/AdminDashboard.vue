<script setup>
import {computed} from 'vue'
import ArtistLayout from '../../components/studio/ArtistLayout.vue'
import PaintLoader from '../../components/PaintLoader.vue'
import GalleryImage from '../../components/GalleryImage.vue'
import {useArtistWorkspace} from '../../composables/useArtistWorkspace'
import {useAuctions} from '../../composables/useAuctions'
import {profileProgress} from '../../lib/studio'
import {countdown,money} from '../../lib/auctions'
const {profile,artworks,loading,problem,refresh}=useArtistWorkspace()
const {auctions,now,problem:auctionProblem}=useAuctions()
const checklist=computed(()=>profileProgress(profile.value))
const complete=computed(()=>checklist.value.filter(item=>item.done).length)
const ownAuctions=computed(()=>auctions.value.filter(a=>artworks.value.some(art=>art.id===a.artwork_id)))
const live=computed(()=>ownAuctions.value.filter(a=>Date.parse(a.ends_at)>now.value))
const bids=computed(()=>ownAuctions.value.reduce((total,a)=>total+a.bid_count,0))
const name=computed(()=>profile.value?.name?.split(' ')[0])
</script>
<template><ArtistLayout section="Overview">
 <header class="studio-page-heading"><div><p class="studio-eyebrow">Your perspective belongs here.</p><h1>{{name?'Welcome back,':'Make room for'}}<br><em>{{name?name+'.':'what’s next.'}}</em></h1><p>From the first idea to someone’s favourite piece.<br>This is where your collection comes together.</p></div><RouterLink to="/admin/artworks?new=1" class="pill studio-primary">Add artwork <span aria-hidden="true">↗</span></RouterLink></header>
 <PaintLoader v-if="loading" label="Opening your artist space…"/>
 <div v-else-if="problem" class="studio-empty" role="alert"><h2>A little pause.</h2><p>{{problem}}</p><button class="pill" @click="refresh">Try again ↗</button></div>
 <template v-else>
  <div class="studio-summary"><RouterLink to="/admin/artworks"><span>In your collection</span><strong>{{artworks.length.toString().padStart(2,'0')}}</strong><small>{{artworks.length===1?'Original artwork':'Original artworks'}} <b>↗</b></small></RouterLink><RouterLink to="/admin/artworks"><span>Open for bidding</span><strong>{{auctionProblem?'—':live.length.toString().padStart(2,'0')}}</strong><small>{{auctionProblem?'Auction updates unavailable':'Live auctions'}} <b>↗</b></small></RouterLink><RouterLink to="/admin/artworks"><span>Collector interest</span><strong>{{auctionProblem?'—':bids.toString().padStart(2,'0')}}</strong><small>Bids on your work <b>↗</b></small></RouterLink></div>
  <div class="studio-overview-columns">
   <section><div class="studio-section-heading"><div><span class="studio-eyebrow">The collection / 01</span><h2>A little of you,<br>out in the world.</h2></div><RouterLink to="/admin/artworks" class="text-link">View all ↗</RouterLink></div>
    <div v-if="artworks.length" class="studio-work-preview"><RouterLink v-for="(art,i) in artworks.slice(0,3)" :key="art.id" :to="{path:'/admin/artworks',query:{edit:art.id}}"><div class="studio-preview-image" :class="'position-'+i"><GalleryImage :src="art.image" :alt="art.title"/><span aria-hidden="true">↗</span></div><h3>{{art.title}}</h3><p>{{[art.category,art.year].filter(Boolean).join(' / ') || 'Original artwork'}}</p></RouterLink></div>
    <div v-else class="studio-empty studio-first-work"><span class="studio-empty-mark" aria-hidden="true">＋</span><h3>Every collection starts<br>with one piece.</h3><p>Upload your first artwork and give it a place in the gallery.</p><RouterLink to="/admin/artworks?new=1" class="text-link">Add your first artwork ↗</RouterLink></div>
   </section>
   <aside class="studio-profile-note"><span class="studio-eyebrow">The person behind the work</span><div class="studio-note-portrait"><GalleryImage v-if="profile?.photo" :src="profile.photo" :alt="profile.name"/><span v-else aria-hidden="true">{{name?.slice(0,1) || '↗'}}</span></div><h2>{{complete===4?'Your story is part of the art.':'Let them meet the maker.'}}</h2><p>{{complete===4?'Keep your profile as current as your practice.':'A portrait, a few words, a point of view. Help collectors get to know you.'}}</p><div class="studio-progress"><span>Profile essentials</span><span>{{complete}} / 4</span></div><div class="studio-progress-track"><i :style="{transform:`scaleX(${complete/4})`}"></i></div><ul class="studio-checklist"><li v-for="item in checklist" :key="item.label"><span :class="{done:item.done}" aria-hidden="true">{{item.done?'✓':'○'}}</span>{{item.label}}<span class="sr-only">{{item.done?'Complete':'Not complete'}}</span></li></ul><RouterLink to="/admin/profile" class="text-link">{{complete===4?'Edit your profile':'Complete your profile'}} ↗</RouterLink></aside>
  </div>
  <section v-if="live.length" class="studio-live-section"><div class="studio-section-heading"><div><p class="studio-eyebrow">In the moment / 02</p><h2>The bidding is open.</h2></div><span class="studio-eyebrow">Updates every 10 seconds</span></div><RouterLink v-for="auction in live" :key="auction.artwork_id" :to="{path:'/admin/artworks',query:{edit:auction.artwork_id}}" class="studio-live-row"><span>{{artworks.find(art=>art.id===auction.artwork_id)?.title}}</span><strong>{{money(auction.current_price)}}</strong><span>{{countdown(auction.ends_at,now)}}</span><span aria-hidden="true">↗</span></RouterLink></section>
 </template>
</ArtistLayout></template>
