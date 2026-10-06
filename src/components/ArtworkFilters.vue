<script setup>
import {computed,useId} from 'vue'
const props=defineProps({modelValue:{type:Object,required:true},countries:{type:Array,default:()=>[]},artists:{type:Array,default:()=>[]},showArtist:{type:Boolean,default:true}})
const emit=defineEmits(['update:modelValue'])
const id=useId()
const ranges=[{key:'Price',label:'Price',unit:'USD',step:'0.01'},{key:'Length',label:'Length',unit:'cm',step:'0.01'}]
const active=computed(()=>Object.values(props.modelValue).some(value=>value!=='' && value!=null))
const invalid=computed(()=>ranges.filter(({key})=>props.modelValue['min'+key]!=='' && props.modelValue['max'+key]!=='' && Number(props.modelValue['min'+key])>Number(props.modelValue['max'+key])).map(({label})=>label))
function update(key,value){emit('update:modelValue',{...props.modelValue,[key]:value})}
function clear(){emit('update:modelValue',Object.fromEntries(Object.keys(props.modelValue).map(key=>[key,''])))}
</script>
<template>
 <section class="artwork-filters" aria-label="Artwork filters">
  <div class="artwork-filter-grid">
   <div class="artwork-filter-field"><label :for="id+'-country'">Country</label><input :id="id+'-country'" :value="modelValue.country" @input="update('country',$event.target.value)" type="search" :list="id+'-countries'" placeholder="Search a country"><datalist :id="id+'-countries'"><option v-for="country in countries" :key="country" :value="country"/></datalist></div>
   <div v-if="showArtist" class="artwork-filter-field"><label :for="id+'-artist'">Artist name</label><input :id="id+'-artist'" :value="modelValue.artist" @input="update('artist',$event.target.value)" type="search" :list="id+'-artists'" placeholder="Search an artist"><datalist :id="id+'-artists'"><option v-for="artist in artists" :key="artist" :value="artist"/></datalist></div>
   <fieldset v-for="range in ranges" :key="range.key" class="artwork-filter-range"><legend>{{range.label}} <span>{{range.unit}}</span></legend><div><label :for="id+'-min'+range.key" class="sr-only">Minimum {{range.label.toLowerCase()}} ({{range.unit}})</label><input :id="id+'-min'+range.key" type="number" min="0" :step="range.step" inputmode="decimal" placeholder="Min" :value="modelValue['min'+range.key]" @input="update('min'+range.key,$event.target.value)"><span aria-hidden="true">–</span><label :for="id+'-max'+range.key" class="sr-only">Maximum {{range.label.toLowerCase()}} ({{range.unit}})</label><input :id="id+'-max'+range.key" type="number" min="0" :step="range.step" inputmode="decimal" placeholder="Max" :value="modelValue['max'+range.key]" @input="update('max'+range.key,$event.target.value)"></div></fieldset>
  </div>
  <div class="artwork-filter-note"><p>Length is the first measurement of the piece, in centimetres.</p><button v-if="active" class="text-link" type="button" @click="clear">Clear filters ×</button></div>
  <p v-if="invalid.length" class="filter-error" role="status">{{invalid.join(' and ')}}: the maximum must be at least the minimum.</p>
 </section>
</template>
