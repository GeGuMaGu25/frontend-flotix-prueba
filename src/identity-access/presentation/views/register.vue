<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toggleLocale } from '@/internationalization/i18n.js'
import { useSessionStore } from '../stores/session.store.js'
import { UserRole } from '../../domain/model/value-objects/user-role.js'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import AppIcon from '@/shared/presentation/components/app-icon.component.vue'
import flotixLogoMark from '@/assets/brand/flotix-logo-mark.png'
import flotixIcon from '@/assets/brand/flotix-icon.png'

const router = useRouter()
const { t, tm, locale } = useI18n()
const session = useSessionStore()

const step = ref(1)

const roleCards = computed(() => [
  { role: UserRole.OWNER, icon: 'truck', ...tm('auth.login.roleTabs.owner') },
  { role: UserRole.DRIVER, icon: 'pin', ...tm('auth.login.roleTabs.driver') },
  { role: UserRole.MECHANIC, icon: 'wrench', ...tm('auth.login.roleTabs.mechanic') }
])

const form = ref({
  name: '', email: '', password: '', role: UserRole.OWNER,
  licenseNumber: '', licenseExpiry: '', companyName: '', workshopName: ''
})
const error = ref('')
const isDriver = computed(() => form.value.role === UserRole.DRIVER)
const selectedRoleLabel = computed(() => roleCards.value.find((r) => r.role === form.value.role)?.title ?? '')

function chooseRole(role) {
  form.value.role = role
  step.value = 2
}

async function submit() {
  error.value = ''
  try {
    await session.register({ ...form.value })
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="grid m-0 min-h-screen">
    <div class="hidden lg:flex col-6 flex-column justify-content-between bg-navy-gradient p-6 relative overflow-hidden">
      <img :src="flotixLogoMark" alt="Flotix" style="height: 32px; width: auto; max-width: 12.5rem; object-fit: contain; object-position: left" />
      <div class="relative z-1">
        <h1 class="text-5xl font-bold text-white m-0 line-height-3" style="letter-spacing: -0.02em">{{ t('auth.brand') }}</h1>
        <p class="text-sm mt-3" style="color: rgba(255,255,255,.6); max-width: 26rem; line-height: 1.6">{{ t('auth.brandSubtitle') }}</p>
        <ul class="list-none p-0 mt-5 flex flex-column gap-3">
          <li v-for="f in tm('auth.features')" :key="f" class="flex align-items-center gap-3 text-sm font-medium" style="color: rgba(255,255,255,.8)">
            <span class="flex align-items-center justify-content-center border-round" style="width: 1.75rem; height: 1.75rem; background: rgba(255,255,255,.1); color: #fff">
              <AppIcon name="truck" :size="15" />
            </span>
            {{ f }}
          </li>
        </ul>
      </div>
      <p class="text-xs relative z-1 m-0" style="color: rgba(255,255,255,.3)">© 2026 Flotix — UPC Developers Team</p>
    </div>

    <div class="col-12 lg:col-6 flex flex-column justify-content-center px-4 py-6 sm:px-7">
      <div class="mx-auto w-full" style="max-width: 24rem">
        <div class="flex align-items-center justify-content-between lg:justify-content-end mb-5">
          <div class="flex lg:hidden align-items-center gap-2">
            <img :src="flotixIcon" alt="Flotix" style="height: 2rem; width: 2rem; object-fit: contain" />
            <p class="font-bold text-heading m-0">FLOTIX</p>
          </div>
          <button type="button" class="flotix-lang-toggle-inline" @click="toggleLocale()">
            <span :class="{ active: locale === 'en' }">EN</span>
            <span :class="{ active: locale === 'es' }">ES</span>
          </button>
        </div>

        <!-- Step 1: role picker -->
        <template v-if="step === 1">
          <h2 class="text-2xl font-bold text-heading m-0" style="letter-spacing: -0.02em">{{ t('auth.register.chooseRoleTitle') }}</h2>
          <p class="text-sm text-muted mt-1">{{ t('auth.register.chooseRoleSubtitle') }}</p>

          <div class="flex flex-column gap-2 mt-4">
            <button v-for="card in roleCards" :key="card.role" type="button" class="flotix-role-card" @click="chooseRole(card.role)">
              <span class="flex align-items-center justify-content-center border-round flex-shrink-0" style="width: 2.5rem; height: 2.5rem; background: var(--p-primary-100); color: var(--p-primary-700)">
                <AppIcon :name="card.icon" :size="19" />
              </span>
              <span class="flex-1 min-w-0 text-left">
                <span class="block text-sm font-semibold text-heading">{{ card.title }}</span>
              </span>
              <AppIcon name="chevronRight" :size="16" class="text-faint flex-shrink-0" />
            </button>
          </div>

          <p class="text-sm text-muted text-center mt-4">
            {{ t('auth.register.haveAccount') }}
            <router-link to="/login" class="flotix-link">{{ t('auth.register.login') }}</router-link>
          </p>
        </template>

        <!-- Step 2: role-specific form -->
        <template v-else>
          <button type="button" class="flotix-link text-xs mb-3" style="font-weight: 500; color: var(--p-surface-500)" @click="step = 1">
            {{ t('auth.register.back') }}
          </button>

          <h2 class="text-2xl font-bold text-heading m-0" style="letter-spacing: -0.02em">{{ t('auth.register.title') }}</h2>
          <div class="inline-flex align-items-center gap-2 border-round-full mt-2 px-2 py-1 text-xs font-semibold" style="background: var(--p-primary-100); color: var(--p-primary-700)">
            <AppIcon :name="roleCards.find((r) => r.role === form.role)?.icon" :size="12" />
            {{ selectedRoleLabel }}
          </div>

          <form class="flex flex-column gap-3 mt-4" @submit.prevent="submit">
            <div class="flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">{{ t('auth.register.name') }} <span class="text-red-500">*</span></label>
              <InputText v-model="form.name" required fluid />
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">{{ t('auth.register.email') }} <span class="text-red-500">*</span></label>
              <InputText v-model="form.email" type="email" required fluid />
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">{{ t('auth.register.password') }} <span class="text-red-500">*</span></label>
              <Password v-model="form.password" :feedback="false" toggle-mask fluid required />
            </div>

            <template v-if="isDriver">
              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-heading">{{ t('auth.register.licenseNumber') }} <span class="text-red-500">*</span></label>
                <InputText v-model="form.licenseNumber" required fluid />
              </div>
              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-heading">{{ t('auth.register.licenseExpiry') }} <span class="text-red-500">*</span></label>
                <DatePicker v-model="form.licenseExpiry" date-format="yy-mm-dd" show-icon fluid required />
              </div>
            </template>
            <div v-else-if="form.role === UserRole.OWNER" class="flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">{{ t('auth.register.companyOptional') }}</label>
              <InputText v-model="form.companyName" fluid />
            </div>
            <div v-else class="flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">{{ t('auth.register.workshopOptional') }}</label>
              <InputText v-model="form.workshopName" fluid />
            </div>

            <p v-if="error" class="text-sm p-2 border-round m-0" style="background: #fef2f2; color: #b91c1c">{{ error }}</p>
            <Button type="submit" :label="t('auth.register.submit')" class="w-full justify-content-center py-3" />
          </form>

          <p class="text-sm text-muted text-center mt-4">
            {{ t('auth.register.haveAccount') }}
            <router-link to="/login" class="flotix-link">{{ t('auth.register.login') }}</router-link>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flotix-lang-toggle-inline {
  display: flex; align-items: center; gap: .15rem;
  border: 1px solid var(--p-surface-200); border-radius: 999px; padding: 2px;
  background: none; cursor: pointer;
}
.flotix-lang-toggle-inline span { padding: .15rem .5rem; border-radius: 999px; font-size: .7rem; font-weight: 700; color: var(--p-surface-900); }
.flotix-lang-toggle-inline span.active { background: var(--p-surface-900); color: #fff; }

.flotix-role-card {
  display: flex; align-items: center; gap: .9rem; width: 100%;
  border: 1px solid var(--p-surface-200); border-radius: 12px; padding: .85rem 1rem;
  background: #fff; cursor: pointer; text-align: left; transition: border-color .15s ease, background-color .15s ease;
}
.flotix-role-card:hover { border-color: var(--p-primary-400); background: var(--p-primary-50); }
</style>
