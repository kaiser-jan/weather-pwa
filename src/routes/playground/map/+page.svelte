<script lang="ts">
  import 'leaflet/dist/leaflet.css'

  import { onMount } from 'svelte'
  import L from 'leaflet'
  import { coordinates } from '$lib/stores/location'
  import { DATASETS } from '$lib/data/providers'
  import PageWrapper from '$lib/components/layout/PageWrapper.svelte'

  let map: L.Map
  let marker: L.Marker

  function init() {
    const { latitude, longitude } = $coordinates ?? { latitude: 0, longitude: 0 }
    map = L.map('map').setView([latitude, longitude], 4)
    marker = L.marker([latitude, longitude]).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
    for (const [index, dataset] of DATASETS.entries()) {
      const color = colors[index % colors.length]

      L.geoJSON(dataset.coverageArea, {
        style: () => ({ color }),
        onEachFeature: (feature, _) => {
          if (feature.geometry.type !== 'Polygon') return
          const coords = feature.geometry.coordinates[0][0]
          const [lon, lat] = coords

          L.marker([lat, lon], {
            icon: L.divIcon({
              className: 'label',
              html: `<div class='w-fit bg-background/40 text-text h-fit py-0.5 px-1'>${dataset.model}</div>`,
              iconAnchor: [0, 0],
            }),
          }).addTo(map)
        },
      }).addTo(map)
    }
  }

  onMount(() => {
    init()

    return coordinates.subscribe((c) => {
      if (!c) return
      if (marker) marker.setLatLng([c.latitude, c.longitude])
      if (map) map.setView([c.latitude, c.longitude], 6)
    })
  })
</script>

<PageWrapper>
  <div id="map" class="h-dvh w-dvw"></div>
</PageWrapper>
