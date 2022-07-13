import { onCleanup, onMount } from 'solid-js'

export function LocalTest() {
  onMount(() => {
    console.log('Local test mount')
  })

  onCleanup(() => {
    console.log('Local test cleanup')
  })

  return <span>test</span>
}
