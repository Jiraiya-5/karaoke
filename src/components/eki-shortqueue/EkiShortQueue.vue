<template>
  <div
    class="eki-shortqueue"
    :class="{
      visible: settings.visual.showQueue,
      'on-bottom':
        settings.visual.playerPosition === 'Arriba' &&
        !settings.visual.fullScreenActive
    }"
  >
    <div class="queue-list">
      <va-scroll-container horizontal size="medium">
        <div
          v-for="(num, index) in queueNums"
          :key="index"
          class="queue-card"
          :class="{ disabled: index >= queueLength }"
        >
          <div class="head">
            <!-- Tooltip info -->
            <va-dropdown
              :auto-placement="true"
              stick-to-edges
              :offset="[10, 0]"
              trigger="hover"
            >
              <template #anchor>
                <fa-icon class="head-icon" icon="fa-solid fa-circle-info" />
              </template>
              <div class="ekimodal">
                <div v-if="index < queueLength" class="modal-info-song">
                  <div class="song-img">
                    <va-image
  class="img"
  :src="playerX.queue[index].gen.img || '/images/default-song.png'"
  
                    />
                  </div>
                  <div class="title">{{ playerX.queue[index].title }}</div>
                </div>
              </div>
            </va-dropdown>

            <span class="head-title">{{ index + 1 }}</span>

            <!-- Dropdown opciones -->
            <va-dropdown
              close-on-click-outside
              :auto-placement="true"
              stick-to-edges
              :offset="[10, 0]"
            >
              <template #anchor>
                <fa-icon
                  class="head-icon"
                  icon="fa-solid fa-ellipsis-vertical"
                />
              </template>
              <div class="ekimodal">
                <div
                  v-if="canMove(index, -1)"
                  class="option"
                  @click="playerX.moveSong(index, -1)"
                  :title="$t('song.moveLeft')"
                >
                  {{ $t('song.moveLeft') }}
                  <fa-icon class="modal-icon" icon="fa-solid fa-arrow-left" />
                </div>
                <div
                  v-if="canMove(index, 1)"
                  class="option"
                  @click="playerX.moveSong(index, 1)"
                  :title="$t('song.moveRight')"
                >
                  {{ $t('song.moveRight') }}
                  <fa-icon class="modal-icon" icon="fa-solid fa-arrow-right" />
                </div>
                <div
                  v-if="index < queueLength"
                  class="option"
                  @click="playerX.removeFromQueue(index)"
                  :title="$t('song.removeFromQueue')"
                >
                  {{ $t('song.removeFromQueue') }}
                </div>
                <div
                  v-if="index < queueLength"
                  class="option"
                  @click="playerX.skipTo(index)"
                  :title="$t('song.play')"
                >
                  {{ $t('song.play') }}
                </div>
              </div>
            </va-dropdown>
          </div>

          <div class="body">
            <va-input
              :id="`${customIdentifier}-short-queue-${index}`"
              :name="`${customIdentifier}-short-queue-${index}`"
              class="num-input"
              input-class="va-text-center"
              v-model="queueNums[index]"
              type="text"
              color="font"
              background="border"
              :loading="loadingStates[index]"
              :mask="{ numericOnly: true, blocks: [7], delimiter: '' }"
              placeholder="0"
              :disabled="index >= queueLength"
              @change="onChangeSong(index)"
            />
          </div>
        </div>
      </va-scroll-container>
    </div>

    <!-- Botón añadir -->
    <div class="queue-card add">
      <div class="head">
        <span class="head-title">{{ $t('add') }}</span>
      </div>
      <div class="body">
        <va-input
          :id="`${customIdentifier}-short-queue-add`"
          :name="`${customIdentifier}-short-queue-add`"
          class="num-input"
          input-class="va-text-center"
          v-model="newSongNum"
          type="text"
          color="font"
          background="border"
          :loading="addingSong"
          :mask="{ numericOnly: true, blocks: [7], delimiter: '' }"
          placeholder="0"
          @change="onAddSong"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import { useRequesterStore } from '@/stores/requester'

const props = defineProps({
  customIdentifier: { type: String, default: 'eki' }
})

const playerX = usePlayerStore()
const userX = useUserStore()
const utilsX = useUtilsStore()
const requesterX = useRequesterStore()

const settings = computed(() => userX.settings)

// ===== Estado =====
const queueLength = ref(0)
const queueNums = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const loadingStates = ref([
  false, false, false, false, false,
  false, false, false, false, false
])
const newSongNum = ref(null)
const addingSong = ref(false)

// ===== Cálculo de la cola =====
watch(
  () => playerX.queue,
  (newQueue) => {
    const nums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const states = [
      false, false, false, false, false,
      false, false, false, false, false
    ]
    let length = 0
    newQueue.forEach((song, i) => {
      if (!song) return
      if (length > nums.length - 1) {
        nums.push(song.num)
        states.push(false)
      } else {
        nums[length] = song.num
      }
      length++
    })
    queueLength.value = length
    loadingStates.value = states
    queueNums.value = nums
  },
  { immediate: true, deep: true }
)

// ===== Puede moverse =====
function canMove(index, direction) {
  if (queueNums.value[index] === 0) return false
  const target = index + direction
  if (target < 0 || target > queueNums.value.length - 1) return false
  if (queueNums.value[target] === 0) return false
  return true
}

// ===== Cambiar canción por número =====
async function onChangeSong(index) {
  try {
    loadingStates.value[index] = true
    const num = queueNums.value[index]
    if (num != 0 && num != '') {
      const res = await requesterX.Get({
        route: `/song-by-number/${num}`,
        withAuth: true
      })
      if (res.status === 200) {
        playerX.updateFromQueue(index, res.data)
      }
    }
  } catch (e) {
    utilsX.setNotif({
      title: 'song.search',
      message: 'song.notFound',
      type: 'error',
      timeVisible: 5,
      position: 'top-center'
    })
  } finally {
    loadingStates.value[index] = false
  }
}

// ===== Añadir canción =====
async function onAddSong() {
  try {
    addingSong.value = true
    const res = await requesterX.Get({
      route: `/song-by-number/${newSongNum.value}`,
      withAuth: true
    })
    if (res.status !== 200) throw 'song not found'
    playerX.addToQueue(res.data)
    newSongNum.value = null
  } catch (e) {
    utilsX.setNotif({
      title: 'song.search',
      message: 'song.notFound',
      type: 'error',
      timeVisible: 5,
      position: 'top-center'
    })
    newSongNum.value = null
  } finally {
    addingSong.value = false
  }
}
</script>

<style scoped>
.eki-shortqueue {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  opacity: 0;
  z-index: -1;
  transition: all 0.3s ease;
  background-color: var(--eki-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.eki-shortqueue.visible {
  height: 81px;
  opacity: 1;
  z-index: 16;
}

.eki-shortqueue.on-bottom {
  top: unset;
  bottom: 0;
}

.eki-shortqueue .queue-list {
  width: calc(100% - 160px);
  height: 100%;
}

.eki-shortqueue .queue-list .va-scroll-container__content {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  grid-gap: 3px;
  grid-auto-flow: column;
}

.eki-shortqueue .queue-card {
  max-width: 160px;
  height: 100%;
  display: flex;
  flex-flow: column;
}

.eki-shortqueue .queue-card.disabled:hover .head {
  background-color: var(--eki-border-color);
}

.eki-shortqueue .queue-card.disabled:hover .head .head-icon {
  opacity: 0;
}

.eki-shortqueue .queue-card.disabled .head {
  background-color: var(--eki-border-color);
}

.eki-shortqueue .queue-card.disabled .head .head-icon {
  cursor: default;
}

.eki-shortqueue .queue-card.disabled .head .head-icon:hover {
  opacity: 0;
}

.eki-shortqueue .queue-card.add {
  width: 160px;
  margin-right: 0;
}

.eki-shortqueue .queue-card.add:hover .head {
  background-color: var(--eki-warning-color);
  cursor: default;
}

.eki-shortqueue .queue-card.add:hover .head .head-title {
  color: var(--eki-border-color);
}

.eki-shortqueue .queue-card.add .head {
  cursor: pointer;
  background-color: var(--eki-warning-color);
  border-bottom: solid 3px var(--eki-warning-color);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  transition: all 0.3s ease;
}

.eki-shortqueue .queue-card.add .head .head-title {
  color: var(--eki-border-color);
  font-weight: bolder;
  width: 100%;
  transition: all 0.3s ease;
}

.eki-shortqueue .queue-card:hover .head {
  background-color: var(--eki-bg-color);
}

.eki-shortqueue .queue-card:hover .head .head-icon {
  opacity: 0.65;
}

.eki-shortqueue .queue-card .head {
  background-color: var(--eki-border-color);
  border-bottom: solid 3px var(--eki-warning-color);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  transition: all 0.3s ease;
}

.eki-shortqueue .queue-card .head .head-title {
  color: var(--eki-warning-color);
  text-align: center;
  font-size: 17px;
  font-weight: bolder;
}

.eki-shortqueue .queue-card .head .head-icon {
  opacity: 0;
  color: var(--eki-text-color);
  transition: all 0.3s ease;
  width: 15px;
  cursor: pointer;
}

.eki-shortqueue .queue-card .body {
  max-width: 100%;
  flex: 1 1 auto;
  background-color: #faebd727;
}

.eki-shortqueue .queue-card .body .num-input {
  --va-input-wrapper-border-radius: 0px;
  --va-input-wrapper-border-width: 0px;
  --va-input-wrapper-min-height: 41px;
  --va-input-content-horizontal-padding: 10px;
}

.modal-info-song {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-direction: column;
}

.modal-info-song .song-img {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
}

.modal-info-song .song-img .img {
  width: 100%;
  height: 100%;
}

.modal-info-song .title {
  margin: 0 10px 15px;
  color: var(--eki-font-color);
  width: 100%;
  text-align: center;
  font-weight: 600;
}

@media screen and (max-width: 1000px) {
  .eki-shortqueue.on-bottom {
    top: unset;
    bottom: 0;
    height: 110px;
    padding-bottom: 25px;
  }
}
</style>