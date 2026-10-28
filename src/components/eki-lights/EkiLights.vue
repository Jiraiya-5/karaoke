


<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const lightContent = computed(() => playerStore.lightContent)
const lightsOff = computed(
  () => Number(lightContent.value) === 0 || lightContent.value === null
)
</script>

<style scoped>
.eki-semaforo {
  position: absolute;
  z-index: 80;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #646877;
  width: 200px;
  height: 90px;
  border-radius: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.eki-semaforo.hide {
  display: none;
}

.eki-semaforo .light {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 5px;
  transition: all 0.5s ease;
  color: var(--eki-font-color);
  font-size: 40px;
  font-weight: 800;
  text-align: center;
  line-height: 50px;
}

.eki-semaforo .light.red { background-color: #fb5969; color: transparent; }
.eki-semaforo .light.red.turned-on { color: #ffd6d6; box-shadow: 0 0 15px #fb5969; }
.eki-semaforo .light.yellow { background-color: #fcd254; color: transparent; }
.eki-semaforo .light.yellow.turned-on { color: #fff7e0; box-shadow: 0 0 15px #fcd254; }
.eki-semaforo .light.green { background-color: #33d195; color: transparent; }
.eki-semaforo .light.green.turned-on { color: #d6ffef; box-shadow: 0 0 15px #33d195; }
</style>