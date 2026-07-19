<script setup lang="ts">
import AppShell from '@/components/shared/AppShell.vue'
import { useSettingsStore } from '@/stores/settingsStore'

useSettingsStore().initialize()
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
